import SkeletonBaseElement from "./SkeletonBase";

const ProfilePageSkeleton: React.FC = () => {
  return (
    <>
      <div className="md:hidden">
        <div className="">
          <div className=" flex items-center pl-3 gap-2 pt-10">
            <SkeletonBaseElement type="w-[60px] h-[60px] rounded-[50%] mt-" />
            <div className="w-full relative">
              <SkeletonBaseElement type="w-[30%] h-6 rounded-md absolute left-[12rem] -top-10" />
              <div className="flex flex-col gap-2">
                <SkeletonBaseElement type="w-[50%] h-6 -mb-2 " />
                <SkeletonBaseElement type="w-[35%] h-6" />
              </div>
            </div>
          </div>
          <div className="pl-3 border border-t-0 border-l-0 border-r-0 border-customGray1 pb-3">
            <SkeletonBaseElement type="w-[55%] h-6" />
          </div>
        </div>

        <div className="mt-7 px-3">
          <SkeletonBaseElement type="w-full h-7 border border-customGray1" />
        </div>
        <div className="tag-page mt-7 pb-10 mb-3 md:w-[100%] md:m-auto lg:w-[100%] 2xl:w-[100%] rounded-md">
          <div className="profile-picture-container ml-4">
            <div className="flex items-center mt-2 gap-2 -mb-4">
              <div>
                <SkeletonBaseElement type="w-[30px] h-[30px] rounded-[50%]" />
              </div>
              <small>
                <SkeletonBaseElement type="w-[120px] h-[18px] rounded-md" />
              </small>
            </div>
          </div>
          <h1 className="-mb-2 ml-4 ">
            <SkeletonBaseElement type="w-[60%] h-[20px] rounded-md" />
          </h1>
          <div className="flex items-center gap-2 ml-[3.2rem]">
            <SkeletonBaseElement type="w-[10%] h-5" />
            <SkeletonBaseElement type="w-[10%] h-5" />
            <SkeletonBaseElement type="w-[10%] h-5" />
          </div>
        </div>
        <div className="tag-page mt-4 pb-10 mb-3 md:w-[100%] md:m-auto lg:w-[100%] 2xl:w-[100%] rounded-md">
          <div className="profile-picture-container ml-4">
            <div className="flex items-center mt-2 gap-2 -mb-4">
              <div>
                <SkeletonBaseElement type="w-[30px] h-[30px] rounded-[50%]" />
              </div>
              <small>
                <SkeletonBaseElement type="w-[120px] h-[18px] rounded-md" />
              </small>
            </div>
          </div>
          <h1 className="-mb-2 ml-4 ">
            <SkeletonBaseElement type="w-[60%] h-[20px] rounded-md" />
          </h1>
          <div className="flex items-center gap-2 ml-[3.2rem]">
            <SkeletonBaseElement type="w-[10%] h-5" />
            <SkeletonBaseElement type="w-[10%] h-5" />
            <SkeletonBaseElement type="w-[10%] h-5" />
          </div>
        </div>
        <div className="tag-page mt-4 pb-10 mb-3 md:w-[100%] md:m-auto lg:w-[100%] 2xl:w-[100%] rounded-md">
          <div className="profile-picture-container ml-4">
            <div className="flex items-center mt-2 gap-2 -mb-4">
              <div>
                <SkeletonBaseElement type="w-[30px] h-[30px] rounded-[50%]" />
              </div>
              <small>
                <SkeletonBaseElement type="w-[120px] h-[18px] rounded-md" />
              </small>
            </div>
          </div>
          <h1 className="-mb-2 ml-4 ">
            <SkeletonBaseElement type="w-[60%] h-[20px] rounded-md" />
          </h1>
          <div className="flex items-center gap-2 ml-[3.2rem]">
            <SkeletonBaseElement type="w-[10%] h-5" />
            <SkeletonBaseElement type="w-[10%] h-5" />
            <SkeletonBaseElement type="w-[10%] h-5" />
          </div>
        </div>
        <div className="tag-page mt-4 pb-10 mb-3 md:w-[100%] md:m-auto lg:w-[100%] 2xl:w-[100%] rounded-md">
          <div className="profile-picture-container ml-4">
            <div className="flex items-center mt-2 gap-2 -mb-4">
              <div>
                <SkeletonBaseElement type="w-[30px] h-[30px] rounded-[50%]" />
              </div>
              <small>
                <SkeletonBaseElement type="w-[120px] h-[18px] rounded-md" />
              </small>
            </div>
          </div>
          <h1 className="-mb-2 ml-4 ">
            <SkeletonBaseElement type="w-[60%] h-[20px] rounded-md" />
          </h1>
          <div className="flex items-center gap-2 ml-[3.2rem]">
            <SkeletonBaseElement type="w-[10%] h-5" />
            <SkeletonBaseElement type="w-[10%] h-5" />
            <SkeletonBaseElement type="w-[10%] h-5" />
          </div>
        </div>
      </div>

      <div className="hidden md:flex mt-[7rem] flex-col gap-4 w-[90%] m-auto lg:w-[80%] xl:w-[70%] 2xl:w-[60%]">
        <div className="relative">
          <SkeletonBaseElement type="w-full h-[300px] rounded-md" />
          <SkeletonBaseElement type="w-[100px] h-[100px] rounded-[50%] absolute -top-14 border border-customGray left-[44%]" />
        </div>
        <div className="  profile-grid h-auto">
          <div className=" ">
            <SkeletonBaseElement type="w-[full] h-[10rem]" />
            <SkeletonBaseElement type="w-[full] h-[10rem] mt-5" />
            <SkeletonBaseElement type="w-[full] h-[10rem] mt-5" />
          </div>
          <div className="">
            <div className="tag-page bg-primary mt-4 pb-10 h-[10rem] mb-3 md:w-[100%] md:m-auto lg:w-[100%] 2xl:w-[100%] rounded-md">
              <div className="profile-picture-container ml-4">
                <div className="flex items-center mt-2 gap-2 -mb-4">
                  <div>
                    <SkeletonBaseElement type="w-[30px] h-[30px] rounded-[50%]" />
                  </div>
                  <small>
                    <SkeletonBaseElement type="w-[120px] h-[18px] rounded-md" />
                  </small>
                </div>
              </div>
              <h1 className="-mb-2 ml-4 ">
                <SkeletonBaseElement type="w-[60%] h-[20px] rounded-md" />
              </h1>
              <div className="flex items-center gap-2 ml-[3.2rem]">
                <SkeletonBaseElement type="w-[10%] h-5" />
                <SkeletonBaseElement type="w-[10%] h-5" />
                <SkeletonBaseElement type="w-[10%] h-5" />
              </div>
            </div>
            <div className="tag-page bg-primary mt-4 pb-10 h-[10rem] mb-3 md:w-[100%] md:m-auto lg:w-[100%] 2xl:w-[100%] rounded-md">
              <div className="profile-picture-container ml-4">
                <div className="flex items-center mt-2 gap-2 -mb-4">
                  <div>
                    <SkeletonBaseElement type="w-[30px] h-[30px] rounded-[50%]" />
                  </div>
                  <small>
                    <SkeletonBaseElement type="w-[120px] h-[18px] rounded-md" />
                  </small>
                </div>
              </div>
              <h1 className="-mb-2 ml-4 ">
                <SkeletonBaseElement type="w-[60%] h-[20px] rounded-md" />
              </h1>
              <div className="flex items-center gap-2 ml-[3.2rem]">
                <SkeletonBaseElement type="w-[10%] h-5" />
                <SkeletonBaseElement type="w-[10%] h-5" />
                <SkeletonBaseElement type="w-[10%] h-5" />
              </div>
            </div>
            <div className="tag-page bg-primary mt-4 pb-10 h-[10rem] mb-3 md:w-[100%] md:m-auto lg:w-[100%] 2xl:w-[100%] rounded-md">
              <div className="profile-picture-container ml-4">
                <div className="flex items-center mt-2 gap-2 -mb-4">
                  <div>
                    <SkeletonBaseElement type="w-[30px] h-[30px] rounded-[50%]" />
                  </div>
                  <small>
                    <SkeletonBaseElement type="w-[120px] h-[18px] rounded-md" />
                  </small>
                </div>
              </div>
              <h1 className="-mb-2 ml-4 ">
                <SkeletonBaseElement type="w-[60%] h-[20px] rounded-md" />
              </h1>
              <div className="flex items-center gap-2 ml-[3.2rem]">
                <SkeletonBaseElement type="w-[10%] h-5" />
                <SkeletonBaseElement type="w-[10%] h-5" />
                <SkeletonBaseElement type="w-[10%] h-5" />
              </div>
            </div>
            <div className="tag-page bg-primary mt-4 pb-10 h-[10rem] mb-3 md:w-[100%] md:m-auto lg:w-[100%] 2xl:w-[100%] rounded-md">
              <div className="profile-picture-container ml-4">
                <div className="flex items-center mt-2 gap-2 -mb-4">
                  <div>
                    <SkeletonBaseElement type="w-[30px] h-[30px] rounded-[50%]" />
                  </div>
                  <small>
                    <SkeletonBaseElement type="w-[120px] h-[18px] rounded-md" />
                  </small>
                </div>
              </div>
              <h1 className="-mb-2 ml-4 ">
                <SkeletonBaseElement type="w-[60%] h-[20px] rounded-md" />
              </h1>
              <div className="flex items-center gap-2 ml-[3.2rem]">
                <SkeletonBaseElement type="w-[10%] h-5" />
                <SkeletonBaseElement type="w-[10%] h-5" />
                <SkeletonBaseElement type="w-[10%] h-5" />
              </div>
            </div>
            <div className="tag-page bg-primary mt-4 pb-10 h-[10rem] mb-3 md:w-[100%] md:m-auto lg:w-[100%] 2xl:w-[100%] rounded-md">
              <div className="profile-picture-container ml-4">
                <div className="flex items-center mt-2 gap-2 -mb-4">
                  <div>
                    <SkeletonBaseElement type="w-[30px] h-[30px] rounded-[50%]" />
                  </div>
                  <small>
                    <SkeletonBaseElement type="w-[120px] h-[18px] rounded-md" />
                  </small>
                </div>
              </div>
              <h1 className="-mb-2 ml-4 ">
                <SkeletonBaseElement type="w-[60%] h-[20px] rounded-md" />
              </h1>
              <div className="flex items-center gap-2 ml-[3.2rem]">
                <SkeletonBaseElement type="w-[10%] h-5" />
                <SkeletonBaseElement type="w-[10%] h-5" />
                <SkeletonBaseElement type="w-[10%] h-5" />
              </div>
            </div>
            <div className="tag-page bg-primary mt-4 pb-10 h-[10rem] mb-3 md:w-[100%] md:m-auto lg:w-[100%] 2xl:w-[100%] rounded-md">
              <div className="profile-picture-container ml-4">
                <div className="flex items-center mt-2 gap-2 -mb-4">
                  <div>
                    <SkeletonBaseElement type="w-[30px] h-[30px] rounded-[50%]" />
                  </div>
                  <small>
                    <SkeletonBaseElement type="w-[120px] h-[18px] rounded-md" />
                  </small>
                </div>
              </div>
              <h1 className="-mb-2 ml-4 ">
                <SkeletonBaseElement type="w-[60%] h-[20px] rounded-md" />
              </h1>
              <div className="flex items-center gap-2 ml-[3.2rem]">
                <SkeletonBaseElement type="w-[10%] h-5" />
                <SkeletonBaseElement type="w-[10%] h-5" />
                <SkeletonBaseElement type="w-[10%] h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePageSkeleton;
