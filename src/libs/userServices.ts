import { runTransaction, doc, getDoc, updateDoc, addDoc, deleteDoc, query, where, getDocs, increment, collection } from "firebase/firestore";
import { firestore } from "./firebase";


export interface UserData {
  readonly email: string;
  readonly uid: string;
  readonly createdAt: string;
  username?: string;
  fullname?: string;
  bio?: string;
  profilePictureUrl?: string;
  interests?: string[];
  languages?: string[];
  work?: string;
  location?: string;
  website_url?: string;
  socialLinks?: {
    twitter: string;
    linkedIn: string;
    github: string;
  };
  education?: string;
}

export interface SimpleRule {
  type: string;
  required?: boolean;
  maxLength?: number;
  pattern?: RegExp;
}

export interface ObjectRule {
  type: "object";
  properties: {
    [key: string]: SimpleRule;
  };
}

export type ValidationRule = SimpleRule | ObjectRule;

export interface UserDataValidationRules {
  [key: string]: ValidationRule;
}

interface ValidationResult {
  isValid: boolean;
  errors: {
    [key: string]: string[];
  };
}


export const Profile = () => {
  
  const userDataValidationRules: UserDataValidationRules = {
    email: {
      type: "string",
      required: true,
      pattern: /^[^@]+@[^@]+\.[^@]+$/,
    },
    username: { type: "string", maxLength: 50 },
    fullname: { type: "string", maxLength: 50 },
    bio: { type: "string", maxLength: 200 },
    profilePictureUrl: { type: "string", pattern: /^https?:\/\/.*$/ },
    interests: { type: "array", maxLength: 20 },
    languages: { type: "array", maxLength: 10 },
    work: { type: 'string', maxLength: 200},
    location: { type: "string", maxLength: 100 },
    education: { type: "string", maxLength: 150 },
    socialLinks: {
      type: "object",
      properties: {
        twitter: {
          type: "string",
          pattern: /^(https?:\/\/)?(www\.)?twitter\.com\/[a-zA-Z0-9_]{1,15}$/,
        },
        linkedIn: {
          type: "string",
          pattern: /^https:\/\/www\.linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/,
        },
        github: {
          type: "string",
          pattern: /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9-]+$/,
        },
      },
    },
  };

  function isObjectRule(rule: ValidationRule): rule is ObjectRule {
    return rule.type === "object" && "properties" in rule;
  }

  const friendlyErrorMessages: { [key: string]: string } = {
    // Social Links
    "socialLinks.twitter":
      "Please enter a valid Twitter URL (https://twitter.com/username)",
    "socialLinks.linkedIn":
      "Please enter a valid LinkedIn URL (https://www.linkedin.com/in/username)",
    "socialLinks.github":
      "Please enter a valid GitHub URL (https://github.com/username)",

    // Basic Info
    username:
      "Username should be between 3 and 30 characters, using only letters, numbers, and underscores",
    fullname: "Please enter your full name (up to 100 characters)",
    bio: "Your bio can be up to 500 characters long",
    location: "Please enter your location (city, country, etc.)",
    work: "This field can only take 400 characters",

    // Profile Picture
    profilePictureUrl: "Please provide a valid URL for your profile picture",

    // Skills and Interests
    interests: "List your interests, separated by commas (up to 20 items)",
    languages:
      "List the programming languages you know, separated by commas (up to 10 items)",

    // Education
    education:
      "Briefly describe your educational background (up to 150 characters)",

    // Generic messages for common validations
    required: "This field is required",
    maxLength: "This field exceeds the maximum allowed length",
    pattern: "Please enter a valid value for this field",
    email: "Please enter a valid email address",
    url: "Please enter a valid URL starting with http:// or https://",
  };

   function validateUserData(
    data: Partial<UserData>
  ): ValidationResult {
    const errors: ValidationResult["errors"] = {};

    for (const [field, value] of Object.entries(data)) {
      if (field in userDataValidationRules) {
        const rules =
          userDataValidationRules[
            field as keyof typeof userDataValidationRules
          ];

        if (
          isObjectRule(rules) &&
          typeof value === "object" &&
          value !== null
        ) {
          // Handle nested object validation (e.g., socialLinks)
          for (const [subField, subValue] of Object.entries(value)) {
            const subRules = rules.properties[subField];
            const subErrors = validateField(
              `${field}.${subField}`,
              subValue,
              subRules
            );
            if (subErrors.length > 0) {
              errors[
                `${field}.${subField}` as keyof ValidationResult["errors"]
              ] = subErrors;
            }
          }
        } else {
          // Handle simple field validation
          const fieldErrors = validateField(field, value, rules);
          if (fieldErrors.length > 0) {
            errors[field] = fieldErrors;
          }
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  function validateField(
    field: string,
    value: any,
    rules: SimpleRule
  ): string[] {
    const fieldErrors: string[] = [];

    // Helper function to get the appropriate error message
    const getErrorMessage = (errorType: string) =>
      friendlyErrorMessages[`${field}.${errorType}`] ||
      friendlyErrorMessages[field] ||
      friendlyErrorMessages[errorType] ||
      `Invalid ${field}`;

    if (rules.required && !value) {
      fieldErrors.push(getErrorMessage("required"));
      return fieldErrors;
    }

    if (value) {
      if (rules.type === "string" && typeof value !== "string") {
        fieldErrors.push(getErrorMessage("type"));
      }

      if (rules.type === "array" && !Array.isArray(value)) {
        fieldErrors.push(getErrorMessage("type"));
      }

      if (
        rules.maxLength &&
        ((typeof value === "string" && value.length > rules.maxLength) ||
          (Array.isArray(value) && value.length > rules.maxLength))
      ) {
        fieldErrors.push(getErrorMessage("maxLength"));
      }

      if (
        rules.pattern &&
        typeof value === "string" &&
        !rules.pattern.test(value)
      ) {
        fieldErrors.push(getErrorMessage("pattern"));
      }
    }

    return fieldErrors;
  }

  const updateUserProfile = async (
    userId: string,
    data: Partial<Omit<UserData, "email" | "uid" | "createdAt">>
  ) => {
    const { isValid, errors } = validateUserData(data);

    if (!isValid) {
      console.error("Validation errors:", errors);
      return;
    }

    try {
      const userRef = doc(firestore, "Users", userId);
      console.log("UserRef:", userRef)
      await updateDoc(userRef, data);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const getUserProfile = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(firestore, "Users", userId));
      if (userDoc.exists()) {
        return userDoc.data() as UserData;
      } else {
        console.log("No user found with ID:", userId);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  };

  const updateUserInterests = async (userId: string, interests: string[]) => {
    try {
      await updateUserProfile(userId, { interests });
    } catch (error) {
      console.error(`Error updating interest: ${error}`);
    }
  };

  const getUserInterests = async (userId: string): Promise<string[]> => {
    const userData = await getUserProfile(userId);
    return userData?.interests || [];
  };

  const getUserLanguages = async (userId: string): Promise<string[]> => {
    const userData = await getUserProfile(userId);
    return userData?.languages || [];
  };

  const getUserProfilePicture = async (
    userId: string
  ): Promise<string | undefined> => {
    try {
      const userRef = doc(firestore, "Users", userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        return userDoc.data().profilePictureUrl;
      }
      return undefined;
    } catch (error) {
      console.error("Error fetching user profile picture:", error);
      return undefined;
    }
  };

  const setUserProfilePicture = async (
    userId: string,
    profilePictureUrl: string
  ) => {
    try {
      await updateUserProfile(userId, { profilePictureUrl });
    } catch (error) {
      console.error('Profile picture upload failed')
    }
  };

  const updateUserBio = async (userId: string, bio: string) => {
    try {
      await updateUserProfile(userId, { bio });
    } catch (error) {
      console.error('Bio update failed')
    }
  };

  const updateUserWork = async (userId: string, work: string) => {
    try {
      await updateUserProfile(userId, { work });
    } catch (error) {
      console.error('Failed to update work')
    }
  };

  const updateUserLanguages = async (userId: string, languages: string[]) => {
    await updateUserProfile(userId, { languages });
  };

  const fetchAuthorName = async (authorId: string) => {
    try {
      const userDoc = await getDoc(doc(firestore, "Users", authorId));
      if (userDoc.exists()) {
        return userDoc.data().fullname || "Anonymous";
      } else {
        return "Anonymous";
      }
    } catch (error) {
      console.error("Error fetching author name:", error);
      return "Anonymous";
    }
  };

  return {
    updateUserProfile,
    getUserProfile,
    fetchAuthorName,
    updateUserInterests,
    getUserInterests,
    updateUserBio,
    getUserLanguages,
    validateUserData,
    getUserProfilePicture,
    validateField,
    userDataValidationRules,
    updateUserLanguages,
    setUserProfilePicture,
    updateUserWork,
  };
};

export const ImplementFollowersFuncs = () => {

  const updateFollowerCount = async (userId: string, count: number) => {
    try {
      const userRef = doc(firestore, "Users", userId);
      console.log(`Updating follower count for user ${userId} by ${count}`);
      await updateDoc(userRef, {
        followerCount: increment(count),
      });
      console.log(`Successfully updated follower count for user ${userId}`);
    } catch (error) {
      console.error("Error updating follower count:", error);
    }
  };

  const getFollowingUsers = async (userId: string): Promise<string[]> => {
    const followsRef = collection(firestore, "Follows");
    const q = query(
      followsRef,
      where("followerId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data().followedId);
  };

  const updateFollowingCount = async (userId: string, count: number) => {
    try {
      const userRef = doc(firestore, "Users", userId);
      console.log(`Updating following count for user ${userId} by ${count}`);
      await updateDoc(userRef, {
        followingCount: increment(count),
      });
      console.log(`Successfully updated following count for user ${userId}`);
    } catch (error) {
      console.error("Error updating following count:", error);
    }
  };

  const followUser = async (currentUserId: string, targetUserId: string) => {
    if (currentUserId === targetUserId) return;

    const followsRef = doc(
      firestore,
      "Follows",
      `${currentUserId}_${targetUserId}`
    );
    const currentUserRef = doc(firestore, "Users", currentUserId);
    const targetUserRef = doc(firestore, "Users", targetUserId);

    try {
      await runTransaction(firestore, async (transaction) => {
        const followDoc = await transaction.get(followsRef);
        if (followDoc.exists()) {
          throw "Already following this user";
        }

        const currentUserDoc = await transaction.get(currentUserRef);
        const targetUserDoc = await transaction.get(targetUserRef);

        if (!currentUserDoc.exists() || !targetUserDoc.exists()) {
          throw "User document does not exist";
        }

        transaction.set(followsRef, {
          followerId: currentUserId,
          followedId: targetUserId,
          createdAt: new Date().toISOString(),
        });

        transaction.update(currentUserRef, {
          followingCount: (currentUserDoc.data().followingCount || 0) + 1,
        });

        transaction.update(targetUserRef, {
          followerCount: (targetUserDoc.data().followerCount || 0) + 1,
        });
      });

      console.log("Successfully followed user");
    } catch (error) {
      console.error("Error following user:", error);
      throw error;
    }

  };

  const unfollowUser = async (currentUserId: string, targetUserId: string) => {
     const followsRef = doc(
       firestore,
       "Follows",
       `${currentUserId}_${targetUserId}`
     );
     const currentUserRef = doc(firestore, "Users", currentUserId);
     const targetUserRef = doc(firestore, "Users", targetUserId);

     try {
       await runTransaction(firestore, async (transaction) => {
         const followDoc = await transaction.get(followsRef);
         if (!followDoc.exists()) {
           throw "Not following this user";
         }

         const currentUserDoc = await transaction.get(currentUserRef);
         const targetUserDoc = await transaction.get(targetUserRef);

         if (!currentUserDoc.exists() || !targetUserDoc.exists()) {
           throw "User document does not exist";
         }

         transaction.delete(followsRef);

         const currentFollowingCount =
           currentUserDoc.data().followingCount || 0;
         transaction.update(currentUserRef, {
           followingCount: Math.max(currentFollowingCount - 1, 0),
         });

         const targetFollowerCount = targetUserDoc.data().followerCount || 0;
         transaction.update(targetUserRef, {
           followerCount: Math.max(targetFollowerCount - 1, 0),
         });
       });

       console.log("Successfully unfollowed user");
     } catch (error) {
       console.error("Error unfollowing user:", error);
       throw error;
     }
  };

  const isFollowingUser = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
    const followsRef = collection(firestore, 'Follows');
    const q = query(
      followsRef,
      where("followerId", "==", currentUserId),
      where("followedId", "==", targetUserId)
    );
    const querySnapshot = await getDocs(q);

    return !querySnapshot.empty;
  }

  const getFollowerCount = async (userId: string): Promise<number> => {
    const userRef = doc(firestore, "Users", userId);
    const userDoc = await getDoc(userRef);
    return userDoc.data()?.followerCount || 0;
  };

  const getFollowingCount = async (userId: string): Promise<number> => {
    const userRef = doc(firestore, "Users", userId);
    const userDoc = await getDoc(userRef);
    return userDoc.data()?.followingCount || 0;
  };

  return {followUser, unfollowUser, getFollowingUsers, getFollowerCount, isFollowingUser, getFollowingCount}
}
