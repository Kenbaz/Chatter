
import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModals, openSignupModal, openSigninModal } from '../_store/modalSlice';
import { useAuth } from '@/src/libs/authServices';
import { RootState } from '../_store/store';
import { FaGoogle } from 'react-icons/fa';
import { MdMail } from 'react-icons/md';

const SignUpOptionsModal: FC = () => {
    const dispatch = useDispatch();
    const { showSignupOptionsModal } = useSelector((state: RootState) => state.modal);

    const { signInWithGoogle } = useAuth();

    const openSignUpWithEmailModal = () => {
        dispatch(closeModals());
        dispatch(openSignupModal());
    };

    const signInWithGoogleAccount = async () => {
        try {
            await signInWithGoogle();
            dispatch(closeModals())
        } catch (error) {
            //
        }
    };

    const oepnSignInModalHandler = () => {
        dispatch(closeModals());
        dispatch(openSigninModal());
    };

    if (!showSignupOptionsModal) return null;

     return (
    <div className="modal text-white">
      <div className="modal-content">
        <span className="close-modal" onClick={() => dispatch(closeModals())}>&times;</span>
        <h2 className="text-center mt-20 font-semibold text-xl">Chatter</h2>
        <div className="flex flex-col items-center mt-10">
          <button onClick={openSignUpWithEmailModal} className="button border w-[300px] p-2 rounded-full relative outline-none"><MdMail className='absolute top-[12px] left-12'/>Sign up with Email</button>
          <button onClick={signInWithGoogleAccount} className="button border mt-5 w-[300px] p-2 rounded-full relative outline-none"><FaGoogle className='absolute top-[12px] left-12'/>Sign up with Google</button>
          <p className="mt-7 text-gray-400">
            Already have an account? <a className="hover:underline cursor-pointer" onClick={oepnSignInModalHandler}>Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpOptionsModal;

