
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
import { tagFuncs } from "@/src/libs/contentServices";


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

  const { registerUser, signInWithGoogle } = useAuth();

  const { initializeDefaultTags } = tagFuncs();

  const signUp = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsEmailSignupLoading(true);
      await registerUser(email, password);
      await initializeDefaultTags()
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
      await initializeDefaultTags()
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
        dispatch(closeModals());
        dispatch(clearError());
        setSuccessMessage("")
  }, [dispatch])

  const switchToSignIn = () => {
    close();
    dispatch(openSigninModal());
  };

  const switchToSignUpOptions = () => {
    close();
    dispatch(openSignupOptionsModal());
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
    <div className="modal text-gray-900 dark:text-white">
      <div className="modal-content text-white">
        <span className="close-modal" onClick={close}>
          &times;
        </span>
        <h2 className="text-center mt-14 text-xl">Chatter with us!</h2>
        <div className="flex flex-col items-center">
          {successMessage ? (
            <p className="text-green-500 mt-4 text-center">{successMessage}</p>
          ) : (
            <form onSubmit={signUp} className="signup-form mt-10">
              <div className="flex flex-col w-72 mb-6">
                <label htmlFor="email"></label>
                <input
                  className="h-8 rounded-full p-2 text-gray-900 dark:text-white outline-none text-base placeholder:text-sm"
                  type="email"
                  ref={emailInput}
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="password"></label>
                <input
                  className="h-8 rounded-full p-2 text-gray-900 dark:text-white outline-none text-base placeholder:text-sm"
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                />
              </div>
              <button
                className="ml-[118px] mt-5 hover:underline text-lg"
                type="submit"
              >
                {isEmailSignupLoading ? "Signing up..." : "Sign up"}
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
                {isGoogleSignupLoading
                  ? "Signing in..."
                  : "Sign up with Google"}
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
                  className="hover:underline cursor-pointer"
                  onClick={switchToSignUpOptions}
                >
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
