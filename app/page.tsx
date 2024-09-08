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
     <div className={`h-screen`}>
       <header className=" w-full  m-auto h-16 p-2 flex gap-3 items-center justify-between">
         <div className="text-outline-teal p-1 text-black text-xl font-bold tracking-wide">
           Chatter
         </div>
         <nav className=" flex gap-4 justify-between items-center py-2 px-3">
           <button className=" py-2 px-3" onClick={() => dispatch(openSignupOptionsModal())}>
             Get started
           </button>
           <button onClick={() => dispatch(openSigninModal())}>Sign in</button>
           <ThemeToggle />
         </nav>
       </header>

       {showSignupOptionsModal && <SignUpOptionsModal />}
       {showSigninModal && <SignInModal />}
       {showSignupModal && <SignUpModal />}
     </div>
   );
}

export default LandingPage;