'use client'
import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { openSigninModal, openSignupOptionsModal } from "./_store/modalSlice";

import SignInModal from "./_components/SignInModal";
import SignUpModal from "./_components/SignUpModal";
import SignUpOptionsModal from "./_components/SignUpOtptionsModal";
import { RootState } from "./_store/store";
import ThemeToggle from "./_components/ThemeToggle";


const LandingPage: FC = () => {
  const dispatch = useDispatch();
  const { showSigninModal, showSignupModal, showSignupOptionsModal } = useSelector((state: RootState) => state.modal);

   return (
     <div className={`min-h-screen`}>
       <header className="border border-customBlack border-t-0 border-l-0 border-r-0 dark:border-tinWhite w-full  m-auto h-[10%] px-2 py-3 flex gap-3 items-center justify-between">
         <div className="text-outline-teal p-1 text-black text-2xl font-bold tracking-wide md:ml-[4%]">
           Chatter
         </div>
         <nav className=" flex gap-10 justify-between items-center py-2 px-3">
           <ThemeToggle />
           <button
             className="py-2 px-3 hover:bg-teal-800 hover:text-white rounded-full"
             onClick={() => dispatch(openSigninModal())}
           >
             Sign in
           </button>
           <button
             className=" py-2 px-7 text-base hidden  rounded-full dark:bg-teal-700 dark:hover:bg-teal-800 bg-teal-800 hover:bg-teal-900 transition-colors duration-200 text-white md:inline-block"
             onClick={() => dispatch(openSignupOptionsModal())}
           >
             Get Started
           </button>
         </nav>
       </header>
       <main className="mx-auto text-start p-5 mt-[25%] md:mt-[30%] md:p-[5%] lg:landscape:mt-[4%] xl:hidden">
         <h2 className="text-4xl pr-[18%] font-bold mb-[8%] dark:text-white md:text-6xl md:pr-[40%] md:mb-[5%] lg:text-7xl lg:landscape:text-5xl lg:landscape:mb-[2%]">
           Where Developers Share Knowledge.
         </h2>
         <p className="text-base mb-[8%] max-w-2xl text-gray-500 dark:text-gray-400 lg:landscape:text-base lg:landscape:mb-[5%]">
           Join Chatter, the platform for developers to post, read and discuss
           cutting-edge articles on programming and technology.
         </p>
         <button
           className=" py-3 px-10 text-base cursor-pointer rounded-full dark:bg-teal-800 bg-teal-900 text-white md:px-14 md:py-4 md:text-base"
           onClick={() => dispatch(openSignupOptionsModal())}
         >
           Start Reading
         </button>
       </main>
       {/** Desktop view */}
       <main className="mx-auto hidden text-start xl:px-[10%] xl:py-[7%] xl:mt-0 xl:block">
         <h2 className="pr-[18%] font-bold xl:mb-[3%] dark:text-white md:pr-[40%] lg:text-7xl 2xl:pr-[50%] 2xl:mb-[2%]">
           Where Developers Share Knowledge.
         </h2>
         <p className="text-base mb-[8%] max-w-2xl text-gray-500 dark:text-gray-400 md:text-xl lg:landscape:text-base lg:landscape:mb-[5%]">
           Join Chatter, the platform for developers to post, read and discuss
           cutting-edge articles on programming and technology.
         </p>
         <button
           className=" py-3 px-10 text-base rounded-full bg-teal-900 hover:bg-teal-950 dark:bg-teal-800 dark:hover:bg-teal-900 transition-colors duration-200 text-white md:py-3 md:text-base xl:text-lg cursor-pointer"
           onClick={() => dispatch(openSignupOptionsModal())}
         >
           Start Reading
         </button>
       </main>
       <footer className=" w-full fixed bottom-0 right-0 py-3 text-sm text-center text-gray-500">
         © 2024 Chatter. All rights reserved.
       </footer>

       {showSignupOptionsModal && <SignUpOptionsModal />}
       {showSigninModal && <SignInModal />}
       {showSignupModal && <SignUpModal />}
     </div>
   );
}

export default LandingPage;