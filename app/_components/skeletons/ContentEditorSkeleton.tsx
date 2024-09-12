import SkeletonBaseElement from "./SkeletonBase";

const ContentEditorSkeleton: React.FC = () => {
    return (
      <div>
        <div className="max-w-4xl mt-14 pb-[5rem] relative mx-auto p-4 md:w-[90%] md:m-auto md:mt-14 md:pb-[6rem] lg:landscape:w-[70%] lg:landscape:m-auto lg:landscape:mt-10 lg:landscape:p-2 lg:landscape:pb-7">
          <SkeletonBaseElement type="w-[130px] h-[30px] rounded-lg mb-7 dark:bg-customGray1 bg-customWhite2" />
          <SkeletonBaseElement type="w-[170px] h-[30px] mb-7 dark:bg-customGray1 bg-customWhite2" />
          <SkeletonBaseElement type="w-[200px] h-[30px] mb-10 dark:bg-customGray1 bg-customWhite2" />
          <SkeletonBaseElement type="dark:bg-customGray1 bg-customWhite2 w-[100%] h-[270px] md:h-[400px] md:mb-[60%] mb-8 lg:h-[350px] lg:landscape:hidden  lg:mb-[40rem] xl:mb-8" />
          <SkeletonBaseElement type="w-[100%] h-[280px] hidden lg:landscape:block xl:h-[400px] dark:bg-customGray1 bg-customWhite2" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SkeletonBaseElement type="w-20 h-10 rounded-lg dark:bg-customGray1 bg-customWhite2" />
              <SkeletonBaseElement type="w-20 h-10 rounded-lg dark:bg-customGray1 bg-customWhite2" />
            </div>
            <SkeletonBaseElement type="w-20 h-10 rounded-lg dark:bg-customGray1 bg-customWhite2" />
          </div>
        </div>
      </div>
    );
};

export default ContentEditorSkeleton;