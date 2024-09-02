import SkeletonBaseElement from "./SkeletonBase";

const AnalyticsSkeleton: React.FC = () => {
    return (
      <div className="detailed-post-analytics mt-14 pb-16 p-2 grid place-items-center md:w-[80%] lg:w-[60%] md:m-auto md:mt-14 2xl:w-[55%]">
        <SkeletonBaseElement type="w-full h-[5rem] mb-0" />
        <SkeletonBaseElement type="w-full h-[5rem] mb-0" />
        <SkeletonBaseElement type="w-full h-[5rem] mb-0" />
        <SkeletonBaseElement type="w-full h-[5rem] mb-0" />
        <SkeletonBaseElement type="w-full h-[5rem] mb-0 2xl:hidden" />
        <SkeletonBaseElement type="w-full h-[5rem] 2xl:hidden" />
        <SkeletonBaseElement type="w-full h-[7rem] md:mt-7 md:h-[8rem]" />
        <SkeletonBaseElement type="w-full h-[7rem] md:mt-7 md:h-[8rem]" />
        <SkeletonBaseElement type="w-full h-[7rem] md:mt-7 md:h-[8rem]" />
        <SkeletonBaseElement type="w-full h-[7rem] md:mt-7 md:h-[8rem] hidden lg:block" />
      </div>
    );
};

export default AnalyticsSkeleton;