import SkeletonBaseElement from "./SkeletonBase";

const AnalyticsSkeleton: React.FC = () => {
    return (
      <div className="detailed-post-analytics mt-14 pb-16 p-2 grid place-items-center md:w-[80%] lg:w-[60%] md:m-auto md:mt-14 2xl:w-[55%]">
        <SkeletonBaseElement type="w-full h-[5rem] mb-0 dark:bg-customGray1 bg-customWhite3" />
        <SkeletonBaseElement type="w-full h-[5rem] mb-0 dark:bg-customGray1 bg-customWhite3" />
        <SkeletonBaseElement type="w-full h-[5rem] mb-0 dark:bg-customGray1 bg-customWhite3" />
        <SkeletonBaseElement type="w-full h-[5rem] mb-0 dark:bg-customGray1 bg-customWhite3" />
        <SkeletonBaseElement type="w-full h-[5rem] mb-0 2xl:hidden dark:bg-customGray1 bg-customWhite3" />
        <SkeletonBaseElement type="w-full h-[5rem] 2xl:hidden dark:bg-customGray1 bg-customWhite3" />
        <SkeletonBaseElement type="w-full h-[7rem] md:mt-7 md:h-[8rem] dark:bg-customGray1 bg-customWhite3" />
        <SkeletonBaseElement type="w-full h-[7rem] md:mt-7 md:h-[8rem] dark:bg-customGray1 bg-customWhite3" />
        <SkeletonBaseElement type="w-full h-[7rem] md:mt-7 md:h-[8rem] dark:bg-customGray1 bg-customWhite3" />
        <SkeletonBaseElement type="w-full h-[7rem] md:mt-7 md:h-[8rem] hidden lg:block dark:bg-customGray1 bg-customWhite3" />
      </div>
    );
};

export default AnalyticsSkeleton;