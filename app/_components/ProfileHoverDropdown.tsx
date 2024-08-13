import { FC } from 'react';
import { UserData } from '@/src/libs/userServices';
import Image from 'next/image';
import Link from 'next/link';
import { MdLocationOn } from 'react-icons/md';
import { FaGraduationCap } from 'react-icons/fa';

const ProfileHoverDropdown: FC<{
    authorData: Partial<UserData>;
    isCurrentUser: boolean;
  isFollowing: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
}> = ({ authorData, isCurrentUser, isFollowing, onFollow, onUnfollow }) => {
  return (
    <div className="profile-hover dark:bg-customGray absolute bg-white shadow-lg p-4 rounded-lg z-10 w-72">
      <div className="w-[40px] h-[40px] rounded-[50%] overflow-hidden flex justify-center items-center mb-2">
        <Image
          src={
            authorData.profilePictureUrl ||
            "/images/default-profile-image-2.jpg"
          }
          alt="Author's profile picture"
          width={40}
          height={40}
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="mb-1">
        <Link href={`/profile/${authorData.uid}`}>
          <span className="font-bold hover:underline">
            {authorData.fullname}
          </span>
        </Link>
      </div>
      {isCurrentUser ? (
        <Link href="/profile/edit">
          <button className="w-full py-1 px-2 rounded bg-gray-200 text-gray-700">
            Edit Profile
          </button>
        </Link>
      ) : (
        <button
          onClick={isFollowing ? onUnfollow : onFollow}
          className={`w-full py-1 px-2 rounded ${
            isFollowing ? "bg-gray-200 text-gray-700" : "bg-blue-500 text-white"
          }`}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      )}
      <div className="hidden">
        {authorData.bio && (
          <p className="text-sm hidden mt-2">{authorData.bio}</p>
        )}
      </div>
      <div className="mt-2 mb-2">
        {authorData.location && (
          <p className="text-base mt-1 flex items-center">
            <span>
              <MdLocationOn />
            </span>
            <span>{authorData.location}</span>
          </p>
        )}
      </div>
      <div className="mb-2">
        {authorData.work && <p className="text-base mt-1"> {authorData.work}</p>}
      </div>
      <div>
        {authorData.education && (
          <p className="text-base mt-1 flex items-center gap-1">
            <span>
              <FaGraduationCap />
            </span>
            <span>{authorData.education}</span>
          </p>
        )}
      </div>
      <div>
        {authorData.socialLinks && (
          <div className="mt-2 flex space-x-2">
            {authorData.socialLinks.twitter && (
              <a
                href={authorData.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitter
              </a>
            )}
            {authorData.socialLinks.linkedIn && (
              <a
                href={authorData.socialLinks.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            )}
            {authorData.socialLinks.github && (
              <a
                href={authorData.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHoverDropdown;