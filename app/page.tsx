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
     <div
       className={`min-h-screen bg-white dark:bg-primary text-black dark:text-tinWhite`}
     >
       <header className="border border-secondary rounded-full w-2/3 m-auto h-16 p-2 flex gap-3 items-center justify-between">
         <h1>Chatter</h1>
         <nav className="mr-10 flex gap-4 w-2/5 justify-between items-center h-8 p-2">
           <button onClick={() => dispatch(openSignupOptionsModal())}>
             Get started
           </button>
           <button onClick={() => dispatch(openSigninModal())}>Sign in</button>
           <ThemeToggle/>
         </nav>
       </header>

       {showSignupOptionsModal && <SignUpOptionsModal />}
       {showSigninModal && <SignInModal />}
       {showSignupModal && <SignUpModal />}
     </div>
   );
}

export default LandingPage;