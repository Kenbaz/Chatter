import React, {
  FC,
  useRef,
  useEffect,
  useState,
  FormEvent,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/libs/authServices";
import { useDispatch, useSelector } from "react-redux";
import { closeModals, openSignupModal } from "../_store/modalSlice";
import { setLoading } from "../_store/loadingSlice";
import { RootState } from "../_store/store";
import {Loader2, XIcon} from 'lucide-react'

const SignInModal: FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isEmailSignupLoading, setIsEmailSignupLoading] = useState(false);
  const [isGoogleSignupLoading, setIsGoogleSignupLoading] = useState(false);
  const emailInput = useRef<HTMLInputElement>(null);

  const { signInUser, signInWithGoogle } = useAuth();

  const router = useRouter();
  const dispatch = useDispatch();
  const { showSigninModal } = useSelector((state: RootState) => state.modal);
  const { isLoading } = useSelector((state: RootState) => state.loading);
  const { error } = useSelector((state: RootState) => state.error);

  const signUserIn = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsEmailSignupLoading(true);
      await signInUser(email, password);
      setTimeout(() => {
        router.push("/feeds");
        close();
      }, 2000);
    } catch (error) {
      //
    } finally {
      setIsEmailSignupLoading(false);
    }
  };

  const signInWithGoogleAccount = async () => {
    try {
      setIsGoogleSignupLoading(true);
      await signInWithGoogle();
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
    dispatch(closeModals());
  }, [dispatch]);

  const swicthToSignUp = () => {
    close();
    dispatch(openSignupModal());
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

  if (!showSigninModal) return null;

  return (
    <div className="modal " onClick={close}>
      <div
        className="modal-content text-white h-[60%] rounded-md md:w-[50%] md:h-[50%] lg:landscape:w-[40%] lg:landscape:h-[70%] lg:landscape:mt-14 2xl:hidden"
        role="dialog"
        aria-labelledby="signin-title"
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className="close-modal rounded-[50%] hover:bg-customGray p-1"
          onClick={close}
          aria-label="Close modal"
        >
          <XIcon size={18} className="md:hidden" />
          <XIcon size={24} className="hidden md:block" />
        </span>
        <h2 id="signin-title" className="text-center mt-14 text-xl">
          Welcome back!
        </h2>
        <div className="flex flex-col items-center">
          <form onSubmit={signUserIn} className="signIn-form mt-10">
            <div className="flex flex-col w-72 mb-6">
              <input
                ref={emailInput}
                className="h-[2.3rem] rounded py-2 px-3 text-gray-900 dark:text-tinWhite outline-none text-base placeholder:text-sm tracking-wide"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email"
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col">
              <input
                className="h-[2.3rem] rounded py-2 dark:text-tinWhite text-gray-900 px-3 outline-none text-base placeholder:text-sm tracking-wide"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                disabled={isLoading}
              />
            </div>
            <button
              className="ml-[118px] mt-5 hover:underline"
              type="submit"
              disabled={isLoading}
            >
              {isEmailSignupLoading ? (
                <Loader2 size={19} className="animate-spin ml-[10px]" />
              ) : (
                "Sign in"
              )}
            </button>
          </form>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <button
            onClick={signInWithGoogleAccount}
            className="mt-2 hover:underline"
            disabled={isLoading}
          >
            {isGoogleSignupLoading ? (
              <Loader2 size={19} className="animate-spin ml-[10px]" />
            ) : (
              "Sign in with Google"
            )}
          </button>
          <p className="mt-4 text-gray-400">
            Don&apos;t have an account?{" "}
            <a
              className="hover:underline cursor-pointer"
              tabIndex={0}
              onClick={swicthToSignUp}
            >
              Sign up
            </a>
          </p>
        </div>
      </div>

      <div
        className="modal-content text-white hidden h-[60%] rounded-md md:w-[50%] md:h-[50%] 2xl:block 2xl:w-[30%] 2xl:h-[60%]"
        role="dialog"
        aria-labelledby="signin-title"
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className="close-modal rounded-[50%] hover:bg-customGray p-1"
          onClick={close}
          aria-label="Close modal"
        >
          <XIcon size={18} className="md:hidden" />
          <XIcon size={24} className="hidden md:block" />
        </span>
        <h2 id="signin-title" className="text-center mt-14 text-xl">
          Welcome back!
        </h2>
        <div className="flex flex-col items-center">
          <form onSubmit={signUserIn} className="signIn-form mt-10">
            <div className="flex flex-col w-72 mb-6">
              <input
                ref={emailInput}
                className="h-[2.3rem] rounded py-2 px-3 text-gray-900 dark:text-tinWhite outline-none text-base placeholder:text-sm tracking-wide"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email"
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col">
              <input
                className="h-[2.3rem] rounded py-2 dark:text-tinWhite text-gray-900 px-3 outline-none text-base placeholder:text-sm tracking-wide"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                disabled={isLoading}
              />
            </div>
            <button
              className="ml-[118px] mt-5 hover:underline"
              type="submit"
              disabled={isLoading}
            >
              {isEmailSignupLoading ? (
                <Loader2 size={19} className="animate-spin ml-[10px]" />
              ) : (
                "Sign in"
              )}
            </button>
          </form>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <button
            onClick={signInWithGoogleAccount}
            className="mt-2 hover:underline"
            disabled={isLoading}
          >
            {isGoogleSignupLoading ? (
              <Loader2 size={19} className="animate-spin ml-[10px]" />
            ) : (
              "Sign in with Google"
            )}
          </button>
          <p className="mt-4 text-gray-400">
            Don&apos;t have an account?{" "}
            <a
              className="hover:underline cursor-pointer"
              tabIndex={0}
              onClick={swicthToSignUp}
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInModal;
