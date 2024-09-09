import React, { FC, useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  closeModals,
  openSignupModal,
  openSigninModal,
} from "../_store/modalSlice";
import { useAuth } from "@/src/libs/authServices";
import { RootState } from "../_store/store";
import { FaGoogle } from "react-icons/fa";
import { MdMail } from "react-icons/md";
import { XIcon } from "lucide-react";

const SignUpOptionsModal: FC = () => {
  const dispatch = useDispatch();
  const { showSignupOptionsModal } = useSelector(
    (state: RootState) => state.modal
  );
  const { signInWithGoogle } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showSignupOptionsModal) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [showSignupOptionsModal]);

  const close = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      dispatch(closeModals());
    }, 300); // Match this with the transition duration
  }, [dispatch]);

  const openSignUpWithEmailModal = () => {
    setIsVisible(false);
    close();
    setTimeout(() => {
      dispatch(openSignupModal());
    }, 300);
  };

  const signInWithGoogleAccount = async () => {
    try {
      await signInWithGoogle();
      dispatch(closeModals());
    } catch (error) {
      //
    }
  };

  const openSignInModalHandler = () => {
    setIsVisible(false);
    close();
    setTimeout(() => {
      dispatch(openSigninModal());
    }, 300);
  };

  if (!showSignupOptionsModal) return null;

  return (
    <div
      className={`modal text-white transition-opacity duration-300 ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`modal-content w-[100%] h-[100%] md:w-[80%] lg:h-[50%] lg:w-[70%] lg:landscape:h-[100%] xl:hidden transition-transform duration-300 ease-in-out ${
          isVisible ? "scale-100" : "scale-95"
        }`}
      >
        {/* Mobile and tablet content */}
        <span
          className="close-modal p-1 rounded-[50%] hover:bg-customGray"
          onClick={close}
          aria-label="Close modal"
        >
          <XIcon size={18} className="md:hidden" />
          <XIcon size={24} className="hidden md:block" />
        </span>
        <h2 className="text-center mt-[40%] lg:mt-[20%] text-xl md:text-3xl font-serif">
          Join Chatter.
        </h2>
        <div className="flex flex-col items-center mt-14">
          <button
            onClick={openSignUpWithEmailModal}
            className="button border w-[280px] p-2 rounded-full flex items-center gap-3 outline-none"
          >
            <MdMail className="ml-[40px] md:text-base" />
            <span className="text-sm md:text-base font-sans">
              Sign up with Email
            </span>
          </button>
          <button
            onClick={signInWithGoogleAccount}
            className="button border mt-5 w-[280px] p-2 text-sm md:text-base rounded-full relative outline-none flex items-center gap-3 font-sans"
          >
            <FaGoogle className="ml-[40px]" />
            Sign up with Google
          </button>
          <p className="mt-7 text-gray-400 font-sans text-[14px] md:text-base">
            Already have an account?{" "}
            <a
              className="hover: cursor-pointer text-center py-1 px-2 rounded-full bg-slate-200 text-slate-900 inline-block xl:hidden"
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
        className={`modal-content hidden xl:block xl:w-[50%] xl:h-[80%] 2xl:w-[40%] 2xl:h-[90%] transition-transform duration-300 ease-in-out ${
          isVisible ? "scale-100" : "scale-95"
        }`}
      >
        {/* Desktop content */}
        <span
          className="close-modal p-1 rounded-[50%] hover:bg-customGray"
          onClick={close}
          aria-label="Close modal"
        >
          <XIcon size={24} />
        </span>
        <h2 className="text-center mt-[20%] text-3xl font-serif">
          Join Chatter.
        </h2>
        <div className="flex flex-col items-center mt-14">
          <button
            onClick={openSignUpWithEmailModal}
            className="button border w-[280px] p-2 rounded-full flex items-center gap-3 outline-none"
          >
            <MdMail className="ml-[40px] text-base" />
            <span className="text-base">Sign up with Email</span>
          </button>
          <button
            onClick={signInWithGoogleAccount}
            className="button border mt-5 w-[280px] p-2 text-base rounded-full relative outline-none flex items-center gap-3"
          >
            <FaGoogle className="ml-[40px]" />
            Sign up with Google
          </button>
          <p className="mt-7 text-gray-400 text-base">
            Already have an account?{" "}
            <a
              className="hover:underline cursor-pointer"
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
