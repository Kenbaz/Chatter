import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { firestore } from "./firebase";
import { useDispatch } from "react-redux";
import { setError, clearError } from "@/app/_store/errorSlice";

interface UserData {
  readonly email: string;
  readonly uid: string;
  readonly createdAt: string;
  displayName?: string;
  fullName?: string;
  bio?: string;
  profilePictureUrl?: string;
  preferredCategories: string[];
  interests?: string[];
  skills?: string[];
  languages?: string[];
  location?: string;
  socialLinks?: {
    twitter?: string;
    linkedIn?: string;
    github?: string;
  };
  education?: {
    institution: string;
    degree: string;
    graduationYear: number;
  }[];
}

interface UserDataValidationRules {
  [key: string]: {
    type: string;
    required?: boolean;
    maxLength?: number;
    pattern?: RegExp;
  };
}

export const Profile = () => {
  const dispatch = useDispatch();

  const userDataValidationRules: UserDataValidationRules = {
    email: {
      type: "string",
      required: true,
      pattern: /^[^@]+@[^@]+\.[^@]+$/,
    },
    displayName: { type: "string", maxLength: 100 },
    fullName: { type: "string", maxLength: 100 },
    bio: { type: "string", maxLength: 500 },
    profilePictureUrl: { type: "string", pattern: /^https?:\/\/.*$/ },
    interests: { type: "array", maxLength: 20 },
    skills: { type: "array", maxLength: 20 },
    languages: { type: "array", maxLength: 10 },
    location: { type: "string", maxLength: 100 },
    education: { type: "array", maxLength: 5 },
  };

  function validateUserData(data: Partial<UserData>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    for (const [field, rules] of Object.entries(userDataValidationRules)) {
      if (field in data) {
        const value = data[field as keyof UserData];

        if (rules.required && !value) {
          errors.push(`${field} is required`);
        }

        if (value) {
          if (rules.type === "string" && typeof value !== "string") {
            errors.push(`${field} nust be a string`);
          }

          if (rules.type === "array" && !Array.isArray(value)) {
            errors.push(`${field} must be an array`);
          }

          if (
            rules.maxLength &&
            ((typeof value === "string" && value.length > rules.maxLength) ||
              (Array.isArray(value) && value.length > rules.maxLength))
          ) {
            errors.push(
              `${field} exceeds maximum length of ${rules.maxLength}`
            );
          }

          if (
            rules.pattern &&
            typeof value === "string" &&
            !rules.pattern.test(value)
          ) {
            errors.push(`${field} does not match the required pattern`);
          }
        }
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  const updateUserProfile = async (
    userId: string,
    data: Partial<Omit<UserData, "email" | "uid" | "createdAt">>
  ) => {
    const { isValid, errors } = validateUserData(data);

    if (isValid) {
      console.error("Validation errors:", errors);
      dispatch(setError(`Validation failed: ${errors}`));
      return;
    }

    try {
      const userRef = doc(firestore, "Users", userId);
      await updateDoc(userRef, data);
      dispatch(clearError());
    } catch (error) {
      console.error("Error updating profile:", error);
      dispatch(setError(`Error updating profile: ${error}`));
    }
  };

  const getUserProfile = async (userId: string): Promise<UserData> => {
    const userRef = doc(firestore, "Users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error("User document does not exist");
    }

    return userDoc.data() as UserData;
  };

  const updateUserInterests = async (userId: string, interests: string[]) => {
    await updateUserProfile(userId, { interests });
  };

  const getUserInterests = async (userId: string): Promise<string[]> => {
    const userData = await getUserProfile(userId);
    return userData.interests || [];
  };

  const setUserProfilePicture = async (
    userId: string,
    profilePictureUrl: string
  ) => {
    await updateUserProfile(userId, { profilePictureUrl });
  };

  const updateUserBio = async (userId: string, bio: string) => {
    await updateUserProfile(userId, { bio });
  };

  const updateUserSkills = async (userId: string, skills: string[]) => {
    await updateUserProfile(userId, { skills });
  };

  const updateUserPreferredCategories = async (
    userId: string,
    categoriesId: string[]
  ) => {
    const userRef = doc(firestore, "Users", userId);
    await updateDoc(userRef, { preferredCategories: categoriesId });
  };

  const getUserPreferredCategories = async (
    userId: string
  ): Promise<string[]> => {
    const userDoc = await getDoc(doc(firestore, "Users", userId));
    return userDoc.data()?.preferredCategories || [];
  };

  const hasUserSetPreferences = async (userId: string): Promise<boolean> => {
    const userRef = doc(firestore, "Users", userId);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() && userDoc.data().preferredCategories?.length > 0;
  };

  const ensureUserFields = async (userId: string) => {
    const userData = await getUserProfile(userId);
    const updates: Partial<Omit<UserData, "email" | "uid" | "createdAt">> = {};

    // List of fields to ensure exists
    const fieldsToEnsure: (keyof Omit<
      UserData,
      "email" | "uid" | "createdAt"
    >)[] = [
      "displayName",
      "fullName",
      "bio",
      "profilePictureUrl",
      "interests",
      "skills",
      "languages",
      "location",
      "socialLinks",
      "education",
    ];

    for (const field of fieldsToEnsure) {
      if (!(field in userData)) {
        switch (field) {
          case "interests":
          case "skills":
          case "languages":
          case "preferredCategories":
            updates[field] = [];
            break;
          case "socialLinks":
            updates[field] = {};
            break;
          case "education":
            updates[field] = [];
            break;
          default:
            if (
              typeof userData[field] === "string" ||
              userData[field] === undefined
            ) {
              updates[field] = "";
            }
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      await updateUserProfile(userId, updates);
    }
  };

  return {
    updateUserProfile,
    getUserProfile,
    updateUserInterests,
    getUserInterests,
    updateUserBio,
    updateUserSkills,
    setUserProfilePicture,
    ensureUserFields,
    updateUserPreferredCategories,
    getUserPreferredCategories,
    hasUserSetPreferences,
  };
};
