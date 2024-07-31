'use client';

import { useState, useEffect, FC } from "react";
import { useParams } from "next/navigation";
import { Profile } from "@/src/libs/userServices";
import { setLoading } from "../_store/loadingSlice";
import { setError, clearError } from "../_store/errorSlice";
import { postFuncs, PostData } from "@/src/libs/contentServices";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../_store/store";
import Image from "next/image";
import Link from "next/link";
import { useRequireAuth } from "@/src/libs/useRequireAuth";
import PostCard from "./PostCard";

interface UserProfileData {
  username: string;
  fullname: string;
  bio: string;
  profilePictureUrl: string;
  interests: string[];
  languages: string[];
  location: string;
  website_url: string;
  socialLinks: {
    twitter: string;
    linkedIn: string;
    github: string;
  };
  education: string;
}

const ProfilePage: FC = () => {
    const { user } = useRequireAuth();
    const { getUserProfile } = Profile();
    const params = useParams();
    const { error } = useSelector((state: RootState) => state.error);
    const { isLoading } = useSelector((state: RootState) => state.loading);
    const dispatch = useDispatch();

    const [profileData, setProfileData] = useState<UserProfileData | null>(null);
    const [userPosts, setUserPosts] = useState<PostData[]>([]);
    const [hasMorePosts, setHasMorePosts] = useState(true);
    const [lastPostId, setLastPostId] = useState<string | null>(null);
    const { getPostsByAuthor } = postFuncs();

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (params.userId) {
                try {
                    const userProfileData = await getUserProfile(params.userId as string);
                    setProfileData(userProfileData as UserProfileData);

                    //Fetch posts
                    const posts = await getPostsByAuthor(params.userId as string);
                    setUserPosts(posts);
                    dispatch(clearError());
                } catch (error) {
                    dispatch(setError('Failed to load user profile'));
                    console.error(error);
                } finally {
                    dispatch(setLoading(false));
                }
            }
        };

        fetchUserProfile();
    }, [params.userId, getUserProfile, dispatch, getPostsByAuthor]);

    const loadMorePosts = async () => {
        if (!hasMorePosts || !params.userId) return;

        try {
            const newPosts = await getPostsByAuthor(params.userId as string, 5, lastPostId);
            if (newPosts.length < 5) {
                setHasMorePosts(false);
            }
            setUserPosts(prevPosts => [...prevPosts, ...newPosts]);
            setLastPostId(newPosts[newPosts.length - 1]?.id || null);
            dispatch(clearError());
        } catch (error) {
            dispatch(setError('Failed to load more posts'))
            console.error('Failed to load more posts:', error);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (!profileData) return <div>User not found</div>;

    const isCurrentUser = user && user.uid === params.userId;

    return (
        <div className="user-profile-page">
            {error && <p className="text-red-600">{error}</p>}
            <div className="profile-header">
                <Image
                    src={profileData.profilePictureUrl || "/default-avatar.png"}
                    alt={`${profileData.username}'s profile picture`}
                    width={150}
                    height={150}
                    className="rounded-full"
                />
                <h1>{profileData.fullname}</h1>
                <small>@{profileData.username}</small>
                <p>{profileData.bio}</p>
                <p>{profileData.location}</p>
                {isCurrentUser && (
                    <Link href="/profile/edit">
                        <button>Edit Profile</button>
                    </Link>
                )}
            </div>

            <div className="user-posts">
                {userPosts.length > 0 ? (
                    userPosts.map((post) => <PostCard key={post.id} post={post} />)
                ) : (
                    <p>No post published yet.</p>
                )}
                {hasMorePosts && (
                    <button onClick={loadMorePosts}>Load More Posts</button>
                )}
            </div>

            <div className="profile-details">
                <section>
                    <h3>Interests</h3>
                    <ul>
                        {profileData.interests.map((interest, index) => (
                            <li key={index}>{interest}</li>
                        ))}
                    </ul>
                </section>

                <section>
                    <h3>Skills/Languages</h3>
                    <ul>
                        {profileData.languages.map((language, index) => (
                            <li key={index}>{language}</li>
                        ))}
                    </ul>
                </section>

                <section>
                    <h3>Education</h3>
                    <p>{profileData.education}</p>
                </section>
            </div>

            <div className="social-links">
                <h3>Connect with {profileData.fullname}</h3>
                {profileData.socialLinks.twitter && (
                    <Link href={profileData.socialLinks.twitter}>Twitter</Link>
                )}
                {profileData.socialLinks.linkedIn && (
                    <Link href={profileData.socialLinks.linkedIn}>LinkedIn</Link>
                )}
                {profileData.socialLinks.github && (
                    <Link href={profileData.socialLinks.github}>GitHub</Link>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;