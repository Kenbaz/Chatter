import { createSlice } from '@reduxjs/toolkit';
import { AppThunk } from './store';
import { useAuth } from '@/src/libs/authServices';

interface ModalState {
    showSignupModal: boolean;
    showSigninModal: boolean;
    showSignupOptionsModal: boolean
}

const initialState: ModalState = {
    showSigninModal: false,
    showSignupModal: false,
    showSignupOptionsModal: false,
};

const modalSlice = createSlice({
    name: 'modal',
    initialState,
    reducers: {
        openSignupModal: (state) => {
            state.showSignupModal = true;
            state.showSigninModal = false;
            state.showSignupOptionsModal = false;
        },
        openSigninModal: (state) => {
            state.showSigninModal = true;
            state.showSignupModal = false;
            state.showSignupOptionsModal = false;
        },
        openSignupOptionsModal: (state) => {
            state.showSignupOptionsModal = true;
            state.showSigninModal = false;
            state.showSignupModal = false;
        },
        closeModals: (state) => {
            state.showSigninModal = false;
            state.showSignupModal = false;
            state.showSignupOptionsModal = false;
        },
    },
});

export const { openSigninModal, openSignupModal, openSignupOptionsModal, closeModals } = modalSlice.actions;


export const signInWithGoogleAccount = (): AppThunk => async (dispatch) => {
    const { signInWithGoogle } = useAuth();

    try {
        await signInWithGoogle();
    } catch (error) {
        //
    }
};

export default modalSlice.reducer;