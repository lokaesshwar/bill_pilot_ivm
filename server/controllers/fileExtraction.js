import { GoogleGenAI } from "@google/genai";
import XLSX from "xlsx";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const sanitizeJSON = (value) =>
  value
    ?.replace(/```json/g, "")
    .replace(/```/g, "")
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/[\u0000-\u001F]+/g, "")
    .trim();

const withDefaultProducts = (payload) => {
  const fallbackProduct = {
    name: null,
    quantity: null,
    unitPrice: null,
    unit: null,
    discount: null,
    taxableValue: null,
    taxRate: null,
    discountrate: null,
    taxAmount: null,
    priceWithTax: null,
  };

  return {
    ...payload,
    invoices: payload.invoices.map((invoice) => ({
      ...invoice,
      products:
        invoice.products && invoice.products.length
          ? invoice.products
          : [fallbackProduct],
    })),
  };
};

const buildInlineData = (files) => {
  return files.map((file) => {
    const isExcel =
      file.mimetype.includes("spreadsheetml") ||
      file.mimetype.includes("excel");

    if (!isExcel) {
      return {
        inlineData: {
          mimeType: file.mimetype,
          data: file.buffer.toString("base64"),
        },
      };
    }

    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const csv = XLSX.utils.sheet_to_csv(sheet);

    return {
      inlineData: {
        mimeType: "text/plain",
        data: Buffer.from(csv).toString("base64"),
      },
    };
  });
};

export const handleFileExtraction = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const prompt = `
You are a strict invoice extraction engine.

Return ONLY valid JSON in this format:

{
  "invoices": [
    {
      "serialNumber": null,
      "invoiceDate": null,
      "customerName": null,
      "customerPhone": null,
      "customerCompanyName": null,
      "gstin": null,
      "totalAmount": null,
      "amountBeforeTax": null,
      "taxamount": null,
      "paymentMethod": null,
      "amountPending": null,
      "status": null,
      "createdBy": null,
      "products": [
        {
          "name": null,
          "quantity": null,
          "unitPrice": null,
          "unit": null,
          "discount": null,
          "taxableValue": null,
          "taxRate": null,
          "discountrate": null,
          "taxAmount": null,
          "priceWithTax": null
        }
      ]
    }
  ]
}
`;

    const contents = [
      {
        role: "user",
        parts: [
          { text: prompt },
          ...buildInlineData(req.files),
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    const raw =
      response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const parsed = JSON.parse(sanitizeJSON(raw));
    const normalized = withDefaultProducts(parsed);

    return res.status(200).json({
      message: "Extraction successful",
      data: normalized,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Failed to extract invoice data",
    });
  }
};
