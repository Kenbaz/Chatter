"use client";

import { FC } from "react";
import MyLanguages from "./MyLanguges";

const SideBar: FC = () => {
  

    return (
      <>
        <div className="p-4 bg-primary w-11/12 m-auto rounded-md lg:mt-2 h-[20%] 2xl:px-0 2xl:w-[68%] 2xl:ml-0 xl:w-[75%] xl:ml-0 xl:mt-2 xl:h-[350px]">
          <div>
            <h3 className="text-white font-bold py-2 border border-t-0 border-l-0 border-r-0 border-headerColor xl:px-4">
              Discussions
            </h3>
          </div>
        </div>
        <div className="bg-primary mt-4 rounded-md p-4 w-11/12 m-auto 2xl:w-[68%] 2xl:ml-0 xl:w-[75%] xl:ml-0">
          <h2 className="font-bold mb-4 py-2 border border-t-0 border-l-0 border-r-0 border-headerColor">
            My Languages
          </h2>
          <MyLanguages />
        </div>
      </>
    );
};

export default SideBar;
