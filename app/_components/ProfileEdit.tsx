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

      <form onSubmit={handleSubmit} className="">
        <div className="p-2 dark:bg-primary dark:text-white mt-2">
          <h1 className="font-bold dark:text-white mb-4 text-xl">Basic Info</h1>
          <label htmlFor="profilePicture">Profile Picture</label>
          <div className="mt-2 flex items-center w-full mb-3">
            <div>
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
            <input
              type="file"
              id="profilePicture"
              accept="image/*"
              onChange={handleProfilePictureUpload}
              className=" border w-full px-2 py-[10.2px] outline-none rounded-md border-customGray1"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={profileData.username}
              onChange={handleInputChange}
              className="dark:text-white p-2 border border-customGray1 rounded-md outline-none text-gray-800"
            />
            {validationErrors.username && (
              <ul className="text-red-500">
                {validationErrors.username.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex flex-col gap-2 mt-3">
            <label htmlFor="fullname">Name</label>
            <input
              type="text"
              id="fullname"
              name="fullname"
              value={profileData.fullname}
              onChange={handleInputChange}
              className="dark:text-white p-2 border dark:border-customGray1 rounded-md outline-none text-gray-800"
            />
            {validationErrors.fullname && (
              <ul className="text-red-500">
                {validationErrors.fullname.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex flex-col gap-2 mt-3">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={profileData.bio}
              onChange={handleInputChange}
              className="dark:text-white border dark:border-customGray1 rounded-md p-2 outline-none text-gray-900"
            />
            {validationErrors.bio && (
              <ul className="text-red-500">
                {validationErrors.bio.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="mt-3 dark:bg-primary p-2 dark:text-white">
          <h1 className="font-bold dark:text-white mb-4 text-xl">Personal</h1>
          <div className="flex flex-col gap-2">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={profileData.location}
              onChange={handleInputChange}
              className="dark:text-white p-2 border dark:border-customGray1 rounded-md outline-none text-gray-800"
            />
            {validationErrors.location && (
              <ul className="text-red-500">
                {validationErrors.location.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="mt-3 dark:bg-primary dark:text-white p-2">
          <h1 className="font-bold dark:text-white mb-4 text-xl">Career</h1>
          <div className="flex flex-col gap-2">
            <label htmlFor="work">Work</label>
            <textarea
              id="work"
              name="work"
              value={profileData.work}
              onChange={handleInputChange}
              className="dark:text-white p-2 border dark:border-customGray1 rounded-md outline-none text-gray-800"
            />
            {validationErrors.work && (
              <ul className="text-red-500">
                {validationErrors.work.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="mt-3 dark:bg-primary dark:text-white p-2">
          <h1 className="font-bold dark:text-white mb-4 text-xl">Coding</h1>
          <div className="flex flex-col gap-2">
            <label htmlFor="Languages">Skills/Languages</label>
            <p>What languages do you currently know?</p>
            <textarea
              id="languages"
              name="languages"
              value={profileData.languages.join(",")}
              onChange={handleInputChange}
              className="dark:text-white p-2 border dark:border-customGray1 rounded-md outline-none text-gray-800"
            />
            {validationErrors.languages && (
              <ul className="text-red-500">
                {validationErrors.languages.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mb-4 mt-3 dark:bg-primary p-2 dark:text-white">
          <h1 className="font-bold dark:text-white mb-4 text-xl">Interests</h1>
          <div className="flex flex-col gap-2">
            <label htmlFor="Interests">Interests</label>
            <div className="relative" onClick={toggleDropdown}>
              <div className="dark:bg-headerColor dark:border-customGray1 border px-4 py-2 rounded-md cursor-pointer">
                {selectedTags.length > 0
                  ? selectedTags.map((tag) => tag).join(", ")
                  : "Select Interests"}
              </div>
              {showTagsDropdown && (
                <div className=" interest-dropdown shadow-lg rounded-md p-3 max-h-56 overflow-y-auto w-full flex flex-wrap gap-3">
                  {tags.map((tag) => (
                    <div
                      key={tag.id}
                      className={`px-2 py-2 rounded-full cursor-pointer hover:bg-teal-800 hover:scale-110 border border-teal-800 ${
                        selectedTags.includes(tag.name)
                          ? "bg-teal-800 opacity-65 text-tinWhite"
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
        </div>
        <div className="dark:bg-primary flex flex-col gap-2 p-2 dark:text-white">
          <label htmlFor="education" className="font-bold">
            Education
          </label>
          <textarea
            id="education"
            name="education"
            value={profileData.education}
            onChange={handleInputChange}
            className="dark:text-white p-2 border dark:border-customGray1 rounded-md outline-none text-gray-800"
          />
          {validationErrors.education && (
            <ul className="text-red-500">
              {validationErrors.education.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-3 dark:bg-primary dark:text-white p-2">
          <h3 className="font-bold dark:text-white mb-4 text-xl">
            Social Links
          </h3>
          <div className="flex flex-col gap-2">
            <div>
              <div className="flex items-center gap-2">
                <label htmlFor="twitter">Twitter/X</label>
                <input
                  type="text"
                  id="twitter"
                  name="twitter"
                  placeholder="Paste url"
                  value={profileData.socialLinks.twitter}
                  onChange={handleSocialLinkChange}
                  className="text-gray-900 border dark:border-customGray1 rounded-md dark:text-white w-full outline-none p-2"
                />
              </div>

              {validationErrors["socialLinks.twitter"] && (
                <ul className="text-red-500">
                  {validationErrors["socialLinks.twitter"].map(
                    (error, index) => (
                      <li key={index}>{error}</li>
                    )
                  )}
                </ul>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <label htmlFor="linkedIn">LinkedIn</label>
                <input
                  type="text"
                  id="linkedIn"
                  name="linkedIn"
                  placeholder="Paste url"
                  value={profileData.socialLinks.linkedIn}
                  onChange={handleSocialLinkChange}
                  className="text-gray-900 border dark:border-customGray1 rounded-md dark:text-white w-full outline-none p-2"
                />
              </div>
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
              <div className="flex items-center gap-2">
                <label htmlFor="github">GitHub</label>
                <input
                  type="text"
                  id="github"
                  name="github"
                  placeholder="Paste url"
                  value={profileData.socialLinks.github}
                  onChange={handleSocialLinkChange}
                  className="text-gray-900 border dark:border-customGray1 rounded-md dark:text-white w-full outline-none p-2"
                />
              </div>

              {validationErrors["socialLinks.github"] && (
                <ul className="text-red-500">
                  {validationErrors["socialLinks.github"].map(
                    (error, index) => (
                      <li key={index}>{error}</li>
                    )
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="p-2 mt-3 dark:bg-primary">
          <button
            className="p-2 w-full rounded-md text-center dark:bg-teal-800 dark:text-white"
            type="submit"
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
