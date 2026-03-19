export default function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3">
      
      {/* Video Card */}
      <div className="animate-pulse bg-neutral-900 p-3 rounded flex gap-4">
        
        <div className="w-70 h-50 bg-neutral-800 rounded"></div>

        <div className="flex flex-col gap-3 flex-2">
          <div className="h-4 bg-neutral-800 rounded w-3/4"></div>
          <div className="h-4 bg-neutral-800 rounded w-1/2"></div>

          <div className="mt-9 h-4 bg-neutral-800 rounded w-1/4"></div>

        <div className="flex mt-9 gap-3 flex-row"> 
          <div className="h-4 bg-neutral-800 rounded w-1/4"></div>
          <div className="h-4 bg-neutral-800 rounded w-1/4"></div>
        </div>

        </div>

      </div>

      {/* Buttons Skeleton */}
      <div className="mt-10 flex gap-3 animate-pulse">
        <div className="h-10 w-40 bg-neutral-800 rounded"></div>
        <div className="h-10 w-40 bg-neutral-800 rounded"></div>
        {/* <div className="h-10 w-40 bg-neutral-800 rounded"></div> */}
      </div>

    </div>
  );
}