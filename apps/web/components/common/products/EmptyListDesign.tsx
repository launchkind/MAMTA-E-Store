import { Button } from "../../../components/ui/button";

interface EmptyListProps {
  message: string;
  resetFilters: () => void;
}

const EmptyListDesign = ({ message, resetFilters }: EmptyListProps) => {
  return (
    <div className="py-10 flex flex-col items-center justify-center w-96 min-h-[400px] bg-background rounded-lg border">
      {/* Empty State Icon */}
      <div className="mb-6">
        <svg
          className="w-16 h-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h18v18H3V3zm2 2v14h14V5H5z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 9h6v6H9V9z"
          />
        </svg>
      </div>

      {/* Message */}
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        No Products Found
      </h3>
      <p className="text-gray-600 text-center max-w-md mb-6">
        {message ||
          "Sorry, no products match your selected filters. Try adjusting or resetting the filters to find what you're looking for."}
      </p>

      {/* Call to Action */}
      <Button
        onClick={resetFilters}
        className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700"
      >
        Reset Filters
      </Button>
    </div>
  );
};

export default EmptyListDesign;
