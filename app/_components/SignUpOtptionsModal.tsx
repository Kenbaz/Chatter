import React, { FC, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  closeModals,
  openSignupModal,
  openSigninModal,
} from "../_store/modalSlice";
import { RootState } from "../_store/store";
import { FaGoogle } from "react-icons/fa";
import { MdMail } from "react-icons/md";
import { XIcon } from "lucide-react";
import { useAuthentication } from "./AuthContext";

const SignUpOptionsModal: FC = () => {
  const dispatch = useDispatch();
  const { showSignupOptionsModal } = useSelector(
    (state: RootState) => state.modal
  );
 
  const {signInWithGoogle} = useAuthentication()

  const openSignUpWithEmailModal = () => {
    close()
    dispatch(openSignupModal());
  };

  const signInWithGoogleAccount = async () => {
    try {
      await signInWithGoogle();
      close()
    } catch (error) {
      //
    }
  };

  const close = useCallback(() => {
    dispatch(closeModals());
  }, [dispatch]);


  const openSignInModalHandler = () => {
    close()
    dispatch(openSigninModal());
  };

  if (!showSignupOptionsModal) return null;

  return (
    <div
      className={`modal dark:text-white transition-opacity duration-75 ease-in-out`}
    >
      <div
        className={`modal-content dark:bg-customGray1 bg-customWhite2 w-[100%] h-[100%] md:w-[80%] lg:h-[50%] lg:w-[70%] lg:landscape:h-[100%] xl:hidden`}
      >
        {/* Mobile and tablet content */}
        <span
          className="close-modal p-1 rounded-[50%] hover:bg-white dark:hover:bg-customGray"
          onClick={close}
        >
          <XIcon size={18} className="md:hidden" />
          <XIcon size={24} className="hidden md:block" />
        </span>
        <h2 className="text-center mt-[50%] lg:mt-[20%] text-xl md:text-3xl font-serif">
          Join Chatter.
        </h2>
        <div className="flex flex-col items-center mt-14">
          <button
            onClick={openSignUpWithEmailModal}
            className="button border border-customBlack dark:border-white w-[280px] p-2 rounded-full flex items-center gap-3 outline-none"
          >
            <MdMail className="ml-[40px] md:text-base" />
            <span className="text-sm md:text-base font-sans">
              Sign up with Email
            </span>
          </button>
          <button
            onClick={signInWithGoogleAccount}
            className="button border dark:border-white border-customBlack mt-5 w-[280px] p-2 text-sm md:text-base rounded-full relative outline-none flex items-center gap-3 font-sans"
          >
            <FaGoogle className="ml-[40px]" />
            Sign up with Google
          </button>
          <p className="mt-7 text-gray-500 font-sans text-[14px] md:text-base">
            Already have an account?{" "}
            <a
              className="hover: cursor-pointer text-center py-1 px-2 rounded-full bg-gray-950 text-white dark:bg-slate-200 dark:text-slate-900 inline-block xl:hidden"
              onClick={openSignInModalHandler}
            >
              Sign in
            </a>
            <a
              className="hover:underline cursor-pointer hidden xl:inline-block"
              onClick={openSignInModalHandler}
            >
              Sign in
            </a>
          </p>
        </div>
      </div>

      <div
        className={`modal-content hidden xl:bg-customWhite2 xl:dark:bg-customGray1 xl:block xl:w-[50%] xl:h-[80%] 2xl:w-[40%] 2xl:h-[90%]`}
      >
        {/* Desktop content */}
        <span
          className="close-modal p-1 rounded-[50%] hover:bg-white dark:hover:bg-customGray"
          onClick={close}
        >
          <XIcon size={24} />
        </span>
        <h2 className="text-center mt-[20%] text-3xl font-serif">
          Join Chatter.
        </h2>
        <div className="flex flex-col items-center mt-14">
          <button
            onClick={openSignUpWithEmailModal}
            className="button border border-customBlack dark:border-white w-[280px] p-2 rounded-full flex items-center gap-3 outline-none"
          >
            <MdMail className="ml-[40px] text-base" />
            <span className="text-base">Sign up with Email</span>
          </button>
          <button
            onClick={signInWithGoogleAccount}
            className="button border dark:border-white border-customBlack mt-5 w-[280px] p-2 text-base rounded-full relative outline-none flex items-center gap-3"
          >
            <FaGoogle className="ml-[40px]" />
            Sign up with Google
          </button>
          <p className="mt-7 text-gray-500 dark:text-gray-400 text-base">
            Already have an account?{" "}
            <a
              className="hover:underline cursor-pointer dark:text-gray-400 text-gray-950"
              onClick={openSignInModalHandler}
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpOptionsModal;
