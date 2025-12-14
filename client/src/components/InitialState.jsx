const EmptyState = ({ heightClass = "min-h-[300px]" }) => {
  return (
    <div
      className={`flex items-center justify-center text-sm text-gray-500 ${heightClass}`}
    >
      No data available. Upload documents above to continue.
    </div>
  );
};

export default EmptyState;
