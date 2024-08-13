"use client";

import { useState, useEffect, FC, ChangeEvent, FormEvent, useRef } from "react";
import { useRequireAuth } from "@/src/libs/useRequireAuth";
import { Profile, UserData } from "@/src/libs/userServices";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/src/libs/firebase";
import { setError, clearError } from "../_store/errorSlice";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../_store/loadingSlice";
import { RootState } from "../_store/store";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { tagFuncs } from "@/src/libs/contentServices";

type ProfileData = {
  username: string;
  fullname: string;
  bio: string;
  profilePictureUrl: string;
  interests: string[];
  work: string;
  languages: string[];
  location: string;
  socialLinks: {
    twitter: string;
    linkedIn: string;
    github: string;
  };
  education: string;
};

const EditProfile: FC = () => {
  const router = useRouter();
  const { user } = useRequireAuth();
  const { error } = useSelector((state: RootState) => state.error);
  const { isLoading } = useSelector((state: RootState) => state.loading);
  const [validationErrors, setValidationErrors] = useState<{
    [K in
      | keyof ProfileData
      | `socialLinks.${keyof ProfileData["socialLinks"]}`]?: string[];
  }>({});

  const {
    getUserProfile,
    validateUserData,
    updateUserProfile,
    setUserProfilePicture,
  } = Profile();

  const dispatch = useDispatch();
  const { getAllTags, getTagNames } = tagFuncs();

  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    username: "",
    fullname: "",
    bio: "",
    profilePictureUrl: "",
    interests: [],
    work: "",
    languages: [],
    location: "",
    socialLinks: {
      twitter: "",
      linkedIn: "",
      github: "",
    },
    education: "",
  });

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const allTags = await getAllTags();
        setTags(allTags);
      } catch (error) {
        dispatch(setError("Failed to fetch tags"));
        console.error(error);
      }
    };

    fetchTags();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const userProfileData = await getUserProfile(user.uid);
          setProfileData((prevData) => ({
            ...prevData,
            ...userProfileData,
          }));
          dispatch(clearError());
        } catch (error) {
          dispatch(setError("Failed to load user profile"));
          console.error(error);
        } finally {
          dispatch(setLoading(false));
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleTagSelection = (tagName: string) => {
    setSelectedTags((prevTags) => {
      if (prevTags.includes(tagName)) {
        return prevTags.filter((tag) => tag !== tagName);
      } else {
        return [...prevTags, tagName];
      }
    });
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTagsDropdown((prev) => !prev);
  };

  const validateClientField = (
    name: keyof ProfileData | `socialLinks.${keyof ProfileData["socialLinks"]}`,
    value: string | string[]
  ) => {
    const fieldToValidate = { [name]: value };
    const { errors } = validateUserData(fieldToValidate as Partial<UserData>);
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [name]: errors[name] || [],
    }));
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let newValue: string | string[] = value;

    if (name === "interests" || name === "languages") {
      newValue = value.split(",").map((item) => item.trim());

      setProfileData((prevData) => ({
        ...prevData,
        [name]: newValue,
      }));

      validateClientField(name as keyof ProfileData, newValue);
    } else {
      setProfileData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSocialLinkChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value,
      },
    }));

    validateClientField(
      `socialLinks.${name}` as `socialLinks.${keyof ProfileData["socialLinks"]}`,
      value
    );
  };

  const handleProfilePictureUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0] && user) {
      const file = e.target.files[0];
      const storageRef = ref(storage, `profile_pictures/${user.uid}`);

      try {
        const snapShot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapShot.ref);
        await setUserProfilePicture(user.uid, downloadURL);
        setProfileData((prev) => ({
          ...prev,
          profilePictureUrl: downloadURL,
        }));
        dispatch(clearError());
      } catch (error) {
        dispatch(setError("Failed to upload profile picture"));
        console.error(error);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { isValid, errors } = validateUserData({
      ...profileData,
      interests: selectedTags,
    });

    if (!isValid) {
      setValidationErrors(errors);
      return;
    }

    if (user) {
      try {
        await updateUserProfile(user.uid, {
          ...profileData,
          interests: selectedTags,
        });
        dispatch(clearError());
        setSuccessMessage("Profile update successful");
        setTimeout(() => {
          router.push(`/profile/${user.uid}`);
        }, 2000);
      } catch (error) {
        dispatch(setError("Failed to update Profile"));
        console.error(error);
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="profile-edit-container text-tinWhite">
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
            <div className="w-[50px] h-[50px] rounded-[50%] overflow-hidden flex justify-center items-center">
              <Image
                src={profileData.profilePictureUrl}
                alt="Profile"
                width={100}
                height={100}
                style={{ objectFit: "cover" }}
                className="profile-picture"
              />
            </div>
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
            className="text-gray-800"
          />
          {validationErrors.username && (
            <ul className="text-red-500">
              {validationErrors.username.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label htmlFor="fullname">Name</label>
          <input
            type="text"
            id="fullname"
            name="fullname"
            value={profileData.fullname}
            onChange={handleInputChange}
            className="text-gray-900"
          />
          {validationErrors.fullname && (
            <ul className="text-red-500">
              {validationErrors.fullname.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={profileData.bio}
            onChange={handleInputChange}
            className="text-gray-900"
          />
          {validationErrors.bio && (
            <ul className="text-red-500">
              {validationErrors.bio.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={profileData.location}
            onChange={handleInputChange}
            className="text-gray-900"
          />
          {validationErrors.location && (
            <ul className="text-red-500">
              {validationErrors.location.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label htmlFor="work">Work</label>
          <textarea
            id="work"
            name="work"
            value={profileData.work}
            onChange={handleInputChange}
            className="text-gray-900"
          />
          {validationErrors.work && (
            <ul className="text-red-500">
              {validationErrors.work.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label htmlFor="Languages">Skills/Languages</label>
          <p>What languages do you currently know?</p>
          <textarea
            id="languages"
            name="languages"
            value={profileData.languages.join(" | ")}
            onChange={handleInputChange}
            className="text-gray-900"
          />
          {validationErrors.languages && (
            <ul className="text-red-500">
              {validationErrors.languages.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="Interests">Interests</label>
          <div className="relative" onClick={toggleDropdown}>
            <div className="bg-gray-800 px-4 py-2 rounded-md cursor-pointer">
              {selectedTags.length > 0
                ? selectedTags.map((tag) => tag).join(", ")
                : "Select Interests"}
            </div>
            {showTagsDropdown && (
              <div className=" interest-dropdown shadow-lg rounded-md p-3 max-h-56 overflow-y-auto w-[40rem] flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className={`px-2 py-2 rounded-full cursor-pointer hover:bg-cyan-800 hover:scale-110 border border-cyan-800 ${
                      selectedTags.includes(tag.name)
                        ? "bg-cyan-800 text-tinWhite"
                        : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTagSelection(tag.name);
                    }}
                  >
                    {tag.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="education">Education</label>
          <textarea
            id="education"
            name="education"
            value={profileData.education}
            onChange={handleInputChange}
            className="text-gray-900"
          />
          {validationErrors.education && (
            <ul className="text-red-500">
              {validationErrors.education.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
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
              className="text-gray-900"
            />
            {validationErrors["socialLinks.twitter"] && (
              <ul className="text-red-500">
                {validationErrors["socialLinks.twitter"].map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label htmlFor="linkedIn">LinkedIn</label>
            <input
              type="text"
              id="linkedIn"
              name="linkedIn"
              value={profileData.socialLinks.linkedIn}
              onChange={handleSocialLinkChange}
              className="text-gray-900"
            />
            {validationErrors["socialLinks.linkedIn"] && (
              <ul className="text-red-500">
                {validationErrors["socialLinks.linkedIn"].map(
                  (error, index) => (
                    <li key={index}>{error}</li>
                  )
                )}
              </ul>
            )}
          </div>
          <div>
            <label htmlFor="github">GitHub</label>
            <input
              type="text"
              id="github"
              name="github"
              value={profileData.socialLinks.github}
              onChange={handleSocialLinkChange}
              className="text-gray-900"
            />
            {validationErrors["socialLinks.github"] && (
              <ul className="text-red-500">
                {validationErrors["socialLinks.github"].map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
};

export default EditProfile;
