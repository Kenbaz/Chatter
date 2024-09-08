
import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModals, openSignupModal, openSigninModal } from '../_store/modalSlice';
import { useAuth } from '@/src/libs/authServices';
import { RootState } from '../_store/store';
import { FaGoogle } from 'react-icons/fa';
import { MdMail } from 'react-icons/md';
import { XIcon } from 'lucide-react';


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
         <div className="modal-content w-[85%] rounded-md h-[65%] md:w-[50%] md:h-[55%] md:-mt-20 lg:landscape:mt-14 lg:landscape:h-[70%] xl:w-[30%]">
           <span
             className="close-modal p-1 rounded-[50%] hover:bg-customGray"
             onClick={() => dispatch(closeModals())}
           >
             <XIcon size={18} className="md:hidden" />
             <XIcon size={24} className="hidden md:block" />
           </span>
           <h2 className="text-center mt-16 font-semibold text-xl">Chatter</h2>
           <div className="flex flex-col items-center mt-10">
             <button
               onClick={openSignUpWithEmailModal}
               className="button border w-[280px] p-2 rounded-lg flex items-center gap-3 outline-none"
             >
               <MdMail className="ml-[40px] md:text-base" />
               <span className="text-sm md:text-base">Sign up with Email</span>
             </button>
             <button
               onClick={signInWithGoogleAccount}
               className="button border mt-5 w-[280px] p-2 text-sm md:text-base rounded-lg relative outline-none flex items-center gap-3"
             >
               <FaGoogle className="ml-[40px]" />
               Sign up with Google
             </button>
             <p className="mt-7 text-gray-400 text-[14px] md:text-base">
               Already have an account?{" "}
               <a
                 className="hover:underline cursor-pointer"
                 onClick={oepnSignInModalHandler}
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

