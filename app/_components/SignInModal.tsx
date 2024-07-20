
import React, { FC, useRef, useEffect, useState, FormEvent, useCallback } from 'react'; 
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/libs/authServices';
import { useDispatch, useSelector } from 'react-redux';
import { closeModals, openSignupModal } from '../_store/modalSlice';
import { setLoading } from '../_store/loadingSlice';
import { RootState } from '../_store/store';

const SignInModal: FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
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
            dispatch(setLoading(true));
            await signInUser(email, password);
            setTimeout(() => {
              router.push("/create-post");
              close();
            }, 2000);
        } catch (error) {
            //
        } finally {
            dispatch(setLoading(false));
        }
    };

    const signInWithGoogleAccount = async () => {
        try {
            dispatch(setLoading(true));
            await signInWithGoogle();
             setTimeout(() => {
               router.push("/create-post");
               close();
             }, 2000);
        } catch (error) {
            //
        } finally {
            dispatch(setLoading(false));
        };
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

    if (!showSigninModal) return null

     return (
    <div className="modal" onClick={close}>
      <div
        className="modal-content text-white"
        role="dialog"
        aria-labelledby="signin-title"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="close-modal" onClick={close} aria-label="Close modal">
          &times;
        </span>
        <h2 id="signin-title" className="text-center mt-14 text-xl">
          Welcome!
        </h2>
        <div className="flex flex-col items-center">
          <form onSubmit={signUserIn} className="signIn-form mt-10">
            <div className="flex flex-col w-72 mb-6">
              <label htmlFor="email"></label>
              <input
                ref={emailInput}
                className="h-8 rounded-full p-2 text-gray-900 outline-none text-base placeholder:text-sm"
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email"
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="password"></label>
              <input
                className="h-8 rounded-full p-2 text-gray-900 outline-none text-base placeholder:text-sm"
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                disabled={isLoading}
              />
            </div>
            <button
              className="ml-[118px] mt-5 hover:underline text-lg"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <button
            onClick={signInWithGoogleAccount}
            className="mt-2 hover:underline"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>
          <p className="mt-4 text-gray-400">
            Don&apos;t have an account? <a className="hover:underline cursor-pointer" tabIndex={0} onClick={swicthToSignUp}>Sign up</a>
          </p>
        </div>
      </div>
      
    </div>
  );
};

export default SignInModal;
