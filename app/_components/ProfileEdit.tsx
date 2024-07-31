'use client';

import { useState, useEffect, FC, ChangeEvent, FormEvent } from "react";
import { useRequireAuth } from "@/src/libs/useRequireAuth";
import { Profile } from "@/src/libs/userServices";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/src/libs/firebase";
import { setError, clearError } from "../_store/errorSlice";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../_store/loadingSlice";
import { RootState } from "../_store/store";
import Image from "next/image";


const EditProfile: FC = () => {
    const { user } = useRequireAuth();
    const { error } = useSelector((state: RootState) => state.error);
    const { isLoading } = useSelector((state: RootState) => state.loading);
    const { getUserProfile, updateUserProfile, setUserProfilePicture } = Profile();

    const dispatch = useDispatch();

    const [successMessage, setSuccessMessage] = useState('');

    const [profileData, setProfileData] = useState({
        username: '',
        fullname: '',
        bio: '',
        profilePictureUrl: '',
        interests: [] as string[],
        languages: [] as string[],
        location: '',
        socialLinks: {
            twitter: '',
            linkedIn: '',
            github: '',
        },
        education: ''
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (user) {
                try {
                    const userProfileData = await getUserProfile(user.uid);
                    setProfileData(prevData => ({
                        ...prevData,
                        ...userProfileData
                    }));
                    dispatch(clearError())
                } catch (error) {
                    dispatch(setError('Failed to load user profile'));
                    console.error(error);
                } finally {
                    dispatch(setLoading(false));
                }
            }
        }

        fetchUserProfile();
    }, [user, getUserProfile, dispatch]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfileData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSocialLinkChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [name]: value,
            }
        }));
    };

    const handleProfilePictureUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && user) {
            const file = e.target.files[0];
            const storageRef = ref(storage, `profile_pictures/${user.uid}`);
            
            try {
                const snapShot = await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(snapShot.ref);
                await setUserProfilePicture(user.uid, downloadURL);
                setProfileData(prev => ({
                    ...prev,
                    profilePictureUrl: downloadURL,
                }));
                dispatch(clearError());
            } catch (error) {
                dispatch(setError('Failed to upload profile picture'));
                console.error(error);
            };
        };
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (user) {
            try {
                await updateUserProfile(user.uid, profileData);
                dispatch(clearError());
                setSuccessMessage('Profile update successful');
            } catch (error) {
                dispatch(setError('Failed to update Profile'));
                console.error(error);
            };
        };
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="profile-edit-container">
            {error && <p className="text-red-600">{error}</p>}
            {successMessage && <p className="text-green-600">{successMessage}</p>}
            <h1>Edit your profile</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="profilePicture">Profile Picture</label>
                    <input
                        type="file"
                        id="profilePicture"
                        accept="image/*"
                        onChange={handleProfilePictureUpload}
                    />
                    {profileData.profilePictureUrl && (
                        <Image
                            src={profileData.profilePictureUrl}
                            alt="Profile"
                            width={150}
                            height={150}
                            className="profile-picture"
                        />
                    )}
                </div>
                <div>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={profileData.username}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label htmlFor="fullname">Name</label>
                    <input
                        type="text"
                        id="fullname"
                        name="fullname"
                        value={profileData.fullname}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label htmlFor="bio">Bio</label>
                    <textarea
                        id="bio"
                        name="bio"
                        value={profileData.bio}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label htmlFor="location">Location</label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        value={profileData.location}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label htmlFor="Languages">Skills/Languages</label>
                    <p>What languages do you currently know?</p>
                    <textarea
                        id="Languages"
                        name="Languages"
                        value={profileData.languages}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label htmlFor="Interests">Interest</label>
                    <textarea
                        id="Interests"
                        name="Interests"
                        value={profileData.interests}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label htmlFor="education">Education</label>
                    <textarea
                        id="education"
                        name="education"
                        value={profileData.education}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <h3>Social Links</h3>
                    <div>
                        <label htmlFor="twitter">Twitter</label>
                        <input
                            type="text"
                            id="twitter"
                            name="twitter"
                            value={profileData.socialLinks.twitter}
                            onChange={handleSocialLinkChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="linkedIn">LinkedIn</label>
                        <input
                            type="text"
                            id="linkedIn"
                            name="linkedIn"
                            value={profileData.socialLinks.linkedIn}
                            onChange={handleSocialLinkChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="github">GitHub</label>
                        <input
                            type="text"
                            id="github"
                            name="github"
                            value={profileData.socialLinks.github}
                            onChange={handleSocialLinkChange}
                        />
                    </div>
                </div>
                <button type="submit">Save Profile</button>
            </form>
        </div>
    );
};

export default EditProfile;