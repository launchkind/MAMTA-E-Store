import Container from "@/components/common/Container";

const SuccessPageSkeleton = () => {
  return (
    <Container className="py-8">
      {/* Breadcrumb Skeleton */}
      <div className="mb-6 animate-pulse">
        <div className="flex items-center gap-2 text-sm">
          <div className="h-4 w-12 bg-gray-200 rounded"></div>
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Success Card Skeleton */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-8 md:p-12 text-center mb-8">
          <div className="animate-pulse">
            {/* Success Icon Skeleton */}
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-8"></div>

            {/* Title Skeleton */}
            <div className="h-10 bg-gray-200 rounded-lg w-3/4 mx-auto mb-4"></div>

            {/* Subtitle Skeleton */}
            <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto mb-8"></div>

            {/* Order Info Card Skeleton */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-24 mx-auto"></div>
                    <div className="h-6 bg-gray-200 rounded w-32 mx-auto"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="h-12 bg-gray-200 rounded-full w-48 mx-auto sm:mx-0"></div>
              <div className="h-12 bg-gray-200 rounded-full w-48 mx-auto sm:mx-0"></div>
              <div className="h-12 bg-gray-200 rounded-full w-32 mx-auto sm:mx-0"></div>
            </div>
          </div>
        </div>

        {/* Order Summary Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 mb-8">
          <div className="animate-pulse">
            {/* Title */}
            <div className="h-7 bg-gray-200 rounded w-48 mb-6"></div>

            {/* Order Items */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg"
                >
                  <div className="w-16 h-16 bg-gray-200 rounded-lg shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t pt-6 mt-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next Section Skeleton */}
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 md:p-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3"></div>
                  <div className="h-5 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default SuccessPageSkeleton;
