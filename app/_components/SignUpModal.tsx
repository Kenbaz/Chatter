
import React, { useEffect, useRef, useState, FC, FormEvent, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/libs/authServices";
import { clearError, setError } from "../_store/errorSlice";
import {
  openSigninModal,
  openSignupOptionsModal,
  closeModals,
} from "../_store/modalSlice";
import { setLoading } from "../_store/loadingSlice";
import { RootState } from "../_store/store";
import { XIcon, Loader2 } from "lucide-react";
import { FaChevronLeft } from "react-icons/fa";


const SignUpModal: FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { showSignupModal } = useSelector((state: RootState) => state.modal);
  const { error } = useSelector((state: RootState) => state.error);
  const { isLoading } = useSelector((state: RootState) => state.loading);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isEmailSignupLoading, setIsEmailSignupLoading] = useState(false);
  const [isGoogleSignupLoading, setIsGoogleSignupLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const emailInput = useRef<HTMLInputElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const { registerUser, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (showSignupModal) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [showSignupModal]);

  const signUp = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsEmailSignupLoading(true);
      await registerUser(email, password);
      setSuccessMessage("User creation successful");

      setTimeout(() => {
          router.push('/feeds')
          close();
        }, 2000);
      
    } catch (error) {
      if (error instanceof Error) {
        dispatch(setError(error.message));
      } else {
        dispatch(setError("An unknown error occurred"));
      }
    } finally {
      setIsEmailSignupLoading(false);
    }
  };

  const signInWithGoogleAccount = async () => {
    try {
      setIsGoogleSignupLoading(true);
      await signInWithGoogle();
      setSuccessMessage("Signed in with Google succesfully");
      setTimeout(() => {
        router.push("/feeds");
        close();
      }, 2000);
    } catch (error) {
      //
    } finally {
      setIsGoogleSignupLoading(false);
    }
  };

    const close = useCallback(() => {
      setIsVisible(false);
      setTimeout(() => {
        dispatch(closeModals());
        dispatch(clearError());
        setSuccessMessage("");
      }, 300); // Match this with the transition duration
    }, [dispatch]);

  const switchToSignIn = () => {
    setIsVisible(false);
    close();
    setTimeout(() => {
     dispatch(openSigninModal());
    }, 300);
  };

  const switchToSignUpOptions = () => {
    setIsVisible(false);
    close();
    setTimeout(() => {
      dispatch(openSignupOptionsModal());
    }, 300);
    };
    
    useEffect(() => {
      const handleEscKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          close();
        }
      };

      document.addEventListener("keydown", handleEscKey);
      if (emailInput.current) {
        emailInput.current.focus();
      }

      return () => {
        document.removeEventListener("keydown", handleEscKey);
      };
    }, [close]);

  if (!showSignupModal) return null;

  return (
    <div
      className={`modal text-gray-900 dark:text-white transition-opacity duration-300 ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`modal-content w-full h-full text-white rounded-md shadow-xl md:w-[80%] md:h-[100%] lg:h-[50%] lg:w-[70%] lg:landscape:w-[60%] lg:landscape:h-[100%] xl:hidden transition-transform duration-300 ease-in-out ${
          isVisible ? "scale-100" : "scale-95"
        }`}
      >
        <span
          className="close-modal rounded-[50%] hover:bg-customGray p-1"
          onClick={close}
          aria-label="Close modal"
        >
          <XIcon size={18} className="md:hidden" />
          <XIcon size={24} className="hidden md:block" />
        </span>
        <h2 className="text-center mt-[50%] md:text-3xl font-serif text-xl lg:mt-[20%]">
          Chatter with us!
        </h2>
        <div className="flex flex-col items-center">
          {successMessage ? (
            <p className="text-green-500 mt-4 text-center">{successMessage}</p>
          ) : (
            <form onSubmit={signUp} className="signup-form mt-14">
              <div className="flex flex-col w-72 mb-6">
                <input
                  className="h-[2.3rem] rounded-md py-2 px-3 text-gray-900 dark:text-white outline-none text-base placeholder:text-sm tracking-wide font-sans"
                  type="email"
                  ref={emailInput}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email"
                />
              </div>
              <div className="flex flex-col">
                <input
                  className="h-[2.3rem] rounded-md py-2 px-3 text-gray-900 dark:text-white outline-none text-base placeholder:text-sm tracking-wide font-sans"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                />
              </div>
              <button
                className="ml-[118px] mt-5 hover:underline font-sans"
                type="submit"
              >
                {isEmailSignupLoading ? (
                  <Loader2 size={19} className="animate-spin ml-[10px]" />
                ) : (
                  "Sign up"
                )}
              </button>
            </form>
          )}
          {error && <p className="text-red-500 mt-2">{error}</p>}
          {!successMessage && (
            <>
              <button
                onClick={signInWithGoogleAccount}
                className="mt-2 hover:underline font-sans"
              >
                {isGoogleSignupLoading ? (
                  <Loader2 size={19} className="animate-spin ml-[10px]" />
                ) : (
                  "Sign up with Google"
                )}
              </button>
              <p className="mt-4 text-gray-400">
                Already have an account?{" "}
                <a
                  className="hover:underline cursor-pointer"
                  onClick={switchToSignIn}
                >
                  Sign in
                </a>
              </p>
              <p className="mt-4 text-sm">
                <a
                  className="hover:underline mt-10 flex items-center cursor-pointer py-[0.3rem] px-3 dark:bg-slate-200 text-gray-900  rounded-full"
                  onClick={switchToSignUpOptions}
                >
                  <FaChevronLeft />
                  All sign up options
                </a>
              </p>
            </>
          )}
        </div>
      </div>
      <div
        className={`modal-content text-white hidden rounded-md shadow-xl xl:w-[50%] xl:h-[80%] 2xl:w-[40%] 2xl:h-[90%] xl:block transition-transform duration-300 ease-in-out ${
          isVisible ? "scale-100" : "scale-95"
        }`}
      >
        <span
          className="close-modal rounded-[50%] hover:bg-customGray p-1"
          onClick={close}
          aria-label="Close modal"
        >
          <XIcon size={18} className="md:hidden" />
          <XIcon size={24} className="hidden md:block" />
        </span>
        <h2 className="text-center xl:mt-[20%] text-2xl font-serif">
          Chatter with us!
        </h2>
        <div className="flex flex-col items-center">
          {successMessage ? (
            <p className="text-green-500 mt-4 text-center">{successMessage}</p>
          ) : (
            <form onSubmit={signUp} className="signup-form mt-10">
              <div className="flex flex-col w-72 mb-6">
                <input
                  className="h-[2.3rem] rounded py-2 px-3 text-gray-900 dark:text-white outline-none text-base placeholder:text-sm tracking-wide font-sans"
                  type="email"
                  ref={emailInput}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email"
                />
              </div>
              <div className="flex flex-col">
                <input
                  className="h-[2.3rem] rounded py-2 px-3 text-gray-900 dark:text-white outline-none text-base placeholder:text-sm tracking-wide font-sans"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                />
              </div>
              <button className="ml-[118px] mt-5 hover:underline" type="submit">
                {isEmailSignupLoading ? (
                  <Loader2 size={19} className="animate-spin ml-[10px]" />
                ) : (
                  "Sign up"
                )}
              </button>
            </form>
          )}
          {error && <p className="text-red-500 mt-2">{error}</p>}
          {!successMessage && (
            <>
              <button
                onClick={signInWithGoogleAccount}
                className="mt-2 hover:underline"
              >
                {isGoogleSignupLoading ? (
                  <Loader2 size={19} className="animate-spin ml-[10px]" />
                ) : (
                  "Sign up with Google"
                )}
              </button>
              <p className="mt-4 text-gray-400">
                Already have an account?{" "}
                <a
                  className="hover:underline cursor-pointer"
                  onClick={switchToSignIn}
                >
                  Sign in
                </a>
              </p>
              <p className="mt-4 text-sm">
                <a
                  className="hover:underline flex items-center gap-1 cursor-pointer"
                  onClick={switchToSignUpOptions}
                >
                  <FaChevronLeft />
                  All sign up options
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUpModal;
