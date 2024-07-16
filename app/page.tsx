'use client'
import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import dynamic from 'next/dynamic';
import { openSigninModal, openSignupOptionsModal } from "./_store/modalSlice";
import SignInModal from "./_components/SignInModal";
import SignUpModal from "./_components/SignUpModal";
import SignUpOptionsModal from "./_components/SignUpOtptionsModal";
import { RootState } from "./_store/store";
import ThemeToggle from "./_components/ThemeToggle";
import "froala-editor/css/froala_style.min.css";
import "froala-editor/css/froala_editor.pkgd.min.css";
import "froala-editor/js/plugins/image.min.js";
import "froala-editor/js/plugins/char_counter.min.js";
import "froala-editor/js/plugins/markdown.min.js";
import "froala-editor/js/plugins/code_view.min.js";
import "froala-editor/js/plugins/video.min.js";



const FroalaEditor = dynamic(() => import("react-froala-wysiwyg"), {
  ssr: false,
});

const FroalaEditorView = dynamic(
  () => import("react-froala-wysiwyg/FroalaEditorView"),
  {
    ssr: false,
  }
);

const LandingPage: FC = () => {
  const dispatch = useDispatch();
  const { showSigninModal, showSignupModal, showSignupOptionsModal } = useSelector((state: RootState) => state.modal);

   return (
     <div className={`min-h-screen`}>
       <header className="border border-secondary rounded-full w-2/3 m-auto h-16 p-2 flex gap-3 items-center justify-between">
         <h1>Chatter</h1>
         <nav className="mr-10 flex gap-4 w-2/5 justify-between items-center h-8 p-2">
           <button onClick={() => dispatch(openSignupOptionsModal())}>
             Get started
           </button>
           <button onClick={() => dispatch(openSigninModal())}>Sign in</button>
           <ThemeToggle />
         </nav>
       </header>
       <div className="w-[50%] m-auto mt-10">
         <FroalaEditor tag="textarea" />
       </div>
       <div>
         <FroalaEditorView/>
       </div>

       {showSignupOptionsModal && <SignUpOptionsModal />}
       {showSigninModal && <SignInModal />}
       {showSignupModal && <SignUpModal />}
     </div>
   );
}

export default LandingPage;