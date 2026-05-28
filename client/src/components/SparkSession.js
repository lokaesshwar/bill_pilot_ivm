export class DataFrame {
  constructor(data, columns, planHistory = []) {
    this.data = data || [];
    this.columns = columns || (data.length > 0 ? Object.keys(data[0]) : []);
    this.planHistory = planHistory.length > 0 ? planHistory : [
      `Relation [${this.columns.join(", ")}] LocalRelation`
    ];
  }

  select(...cols) {
    const selectedData = this.data.map(row => {
      const newRow = {};
      cols.forEach(col => {
        newRow[col] = row[col];
      });
      return newRow;
    });
    return new DataFrame(selectedData, cols, [
      ...this.planHistory,
      `Project [${cols.join(", ")}]`
    ]);
  }

  filter(predicateFn, description = "Filter") {
    const filteredData = this.data.filter(predicateFn);
    return new DataFrame(filteredData, this.columns, [
      ...this.planHistory,
      `Filter (${description})`
    ]);
  }

  groupBy(...groupCols) {
    return new GroupedDataFrame(this, groupCols);
  }

  orderBy(col, ascending = true) {
    const sortedData = [...this.data].sort((a, b) => {
      const valA = a[col];
      const valB = b[col];
      if (typeof valA === "number" && typeof valB === "number") {
        return ascending ? valA - valB : valB - valA;
      }
      return ascending 
        ? String(valA).localeCompare(String(valB)) 
        : String(valB).localeCompare(String(valA));
    });
    return new DataFrame(sortedData, this.columns, [
      ...this.planHistory,
      `Sort [${col} ${ascending ? "ASC" : "DESC"}], true`
    ]);
  }

  show(limit = 20) {
    if (this.data.length === 0) {
      return "+-----------------+\n| Empty DataFrame |\n+-----------------+";
    }
    const cols = this.columns;
    const colWidths = {};
    cols.forEach(col => {
      colWidths[col] = col.length;
    });
    const displayData = this.data.slice(0, limit);
    displayData.forEach(row => {
      cols.forEach(col => {
        const valStr = row[col] === undefined || row[col] === null ? "null" : String(row[col]);
        colWidths[col] = Math.max(colWidths[col], valStr.length);
      });
    });

    let border = "+";
    cols.forEach(col => {
      border += "-".repeat(colWidths[col] + 2) + "+";
    });

    let header = "|";
    cols.forEach(col => {
      header += " " + col.padEnd(colWidths[col]) + " |";
    });

    let rowsStr = "";
    displayData.forEach(row => {
      rowsStr += "\n|";
      cols.forEach(col => {
        const valStr = row[col] === undefined || row[col] === null ? "null" : String(row[col]);
        const isNum = typeof row[col] === "number";
        const padFn = isNum ? "padStart" : "padEnd";
        rowsStr += " " + valStr[padFn](colWidths[col]) + " |";
      });
    });

    return `${border}\n${header}\n${border}${rowsStr}\n${border}`;
  }

  explain() {
    const steps = [...this.planHistory].reverse();
    let res = "== Parsed Logical Plan ==\n";
    res += steps.map((s, idx) => " ".repeat(idx * 2) + "+- " + s).join("\n") + "\n\n";
    
    res += "== Analyzed Logical Plan ==\n";
    res += steps.map((s, idx) => " ".repeat(idx * 2) + "+- " + s.replace("Relation", "RelationV2")).join("\n") + "\n\n";

    res += "== Optimized Logical Plan ==\n";
    const optimized = steps.filter(s => !s.includes("Relation"));
    optimized.push("LocalTableScan [codegen id = 1]");
    res += optimized.map((s, idx) => " ".repeat(idx * 2) + "+- " + s).join("\n") + "\n\n";

    res += "== Physical Plan ==\n";
    res += "*(1) WholeStageCodegen (1)\n";
    res += optimized.map((s, idx) => " ".repeat((idx + 1) * 2) + "+- " + s.replace("Project", "ColumnarProject").replace("Filter", "FilterExec")).join("\n");
    return res;
  }
}

class GroupedDataFrame {
  constructor(df, groupCols) {
    this.df = df;
    this.groupCols = groupCols;
  }

  agg(aggExprs) {
    const grouped = {};
    this.df.data.forEach(row => {
      const key = this.groupCols.map(c => row[c]).join("||");
      if (!grouped[key]) {
        grouped[key] = {
          groupVals: this.groupCols.map(c => row[c]),
          rows: []
        };
      }
      grouped[key].rows.push(row);
    });

    const resultData = [];
    Object.keys(grouped).forEach(k => {
      const g = grouped[k];
      const newRow = {};
      this.groupCols.forEach((col, idx) => {
        newRow[col] = g.groupVals[idx];
      });

      Object.keys(aggExprs).forEach(col => {
        const type = aggExprs[col];
        const vals = g.rows.map(r => Number(r[col]) || 0);
        let aggVal = 0;
        if (type === "sum") {
          aggVal = vals.reduce((a, b) => a + b, 0);
        } else if (type === "avg") {
          aggVal = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
        } else if (type === "max") {
          aggVal = Math.max(...vals);
        } else if (type === "min") {
          aggVal = Math.min(...vals);
        } else if (type === "count") {
          aggVal = vals.length;
        }
        
        if (aggVal % 1 !== 0) {
          aggVal = Math.round(aggVal * 100) / 100;
        }
        newRow[`${type}(${col})`] = aggVal;
      });

      resultData.push(newRow);
    });

    const newCols = [...this.groupCols, ...Object.keys(aggExprs).map(col => `${aggExprs[col]}(${col})`)];

    return new DataFrame(resultData, newCols, [
      ...this.df.planHistory,
      `HashAggregate(keys=[${this.groupCols.join(", ")}], functions=[${Object.entries(aggExprs).map(([col, type]) => `${type}(${col})`).join(", ")}])`
    ]);
  }
}

export const SparkSession = {
  builder: {
    appName: (name) => SparkSession,
    getOrCreate: () => SparkSession
  },
  read: {
    json: (invoicesData) => {
      return new DataFrame(invoicesData);
    }
  }
};
