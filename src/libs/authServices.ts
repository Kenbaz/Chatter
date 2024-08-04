'use client';

import { auth, firestore } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import type { AuthError, User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import { setError, clearError } from '@/app/_store/errorSlice';

interface UserDetails {
    email: string | null;
    uid: string;
    createdAt: string;
    followerCount: number;
    followingCount: number;
}

export const useAuth = () => {
    const dispatch = useDispatch();

    const registerUser = async (email: string, password: string): Promise<User> => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("User created:", user);

            await storeUserInDatabase(user);
            dispatch(clearError());
            return user;
        } catch (error) {
            let errorMessage = "Failed to register user";

            if ((error as AuthError).code) {
                const authError = error as AuthError;
                switch (authError.code) {
                    case 'auth/weak-password':
                        errorMessage = 'The password is too weak';
                        break;
                    case 'auth/email-already-in-use':
                        errorMessage = "The email address is already in use by another account";
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'This email address is invalid';
                        break;
                    default:
                        errorMessage += `: ${authError.message}`
                        break;
                }
            } else if (error instanceof Error) {
                errorMessage += `: ${error.message}`
            }
            dispatch(setError(errorMessage));
            console.error(errorMessage);
            throw error
        }
    };

    const storeUserInDatabase = async (user: User): Promise<void> => {
        const userDetails: UserDetails = {
            email: user.email || 'No email provided',
            uid: user.uid,
            createdAt: new Date().toISOString(),
            followerCount: 0,
            followingCount: 0,
        };

        try {
            await setDoc(doc(firestore, 'Users', user.uid), userDetails);
            console.log('User data saved successfully');
        } catch (error) {
            console.error("Error saving user data:", error);
            throw error;
        }
    };

    const signInUser = async (email: string, password: string): Promise<User> => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            dispatch(clearError());
            return userCredential.user;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("Error signing in user:", errorMessage);
            dispatch(setError('Failed to sign in user'));
            throw error
        }
    };

    const signInWithGoogle = async (): Promise<User> => {
        const provider = new GoogleAuthProvider();

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            await storeUserInDatabase(user);
            dispatch(clearError());
            return user;
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            dispatch(setError(`Failed to sign in with Google`));
            console.error("Error signing in with Google:", errorMessage);
            throw error;
        }
    };

    const signOutUser = async (): Promise<void> => {
        try {
            await signOut(auth);
            dispatch(clearError());
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            dispatch(setError(`Failed to sign out: ${errorMessage}`));
            console.error("Error signing out:", errorMessage);
            throw error;
        }
    };

    return { registerUser, signInUser, signInWithGoogle, signOutUser };
}