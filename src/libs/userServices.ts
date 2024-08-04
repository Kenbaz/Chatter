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
  location?: string;
  website_url?: string;
  socialLinks?: {
    twitter: string;
    linkedIn: string;
    github: string;
  };
  education?: string;
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

    if (!isValid) {
      console.error("Validation errors:", errors);
      return;
    }

    try {
      const userRef = doc(firestore, "Users", userId);
      await updateDoc(userRef, data);
    } catch (error) {
      console.error("Error updating profile:", error);
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
    try {
      await updateUserProfile(userId, { interests });
    } catch (error) {
      console.error(`Error updating interest: ${error}`);
    }
  };

  const getUserInterests = async (userId: string): Promise<string[]> => {
    const userData = await getUserProfile(userId);
    return userData.interests || [];
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

  const updateUserLanguages = async (userId: string, languages: string[]) => {
    await updateUserProfile(userId, { languages });
  };


  // const ensureUserFields = async (userId: string) => {
  //   const userData = await getUserProfile(userId);
  //   const updates: Partial<Omit<UserData, "email" | "uid" | "createdAt">> = {};

  //   // List of fields to ensure exists
  //   const fieldsToEnsure: (keyof Omit<
  //     UserData,
  //     "email" | "uid" | "createdAt"
  //   >)[] = [
  //     "username",
  //     "fullname",
  //     "bio",
  //     "profilePictureUrl",
  //     "interests",
  //     "skills",
  //     "languages",
  //     "location",
  //     "socialLinks",
  //     "education",
  //   ];

  //   for (const field of fieldsToEnsure) {
  //     if (!(field in userData)) {
  //       switch (field) {
  //         case "interests":
  //         case "skills":
  //         case "languages":
  //         case "preferredCategories":
  //           updates[field] = [];
  //           break;
  //         case "socialLinks":
  //           updates[field] = {};
  //           break;
  //         case "education":
  //           updates[field] = [];
  //           break;
  //         default:
  //           if (
  //             typeof userData[field] === "string" ||
  //             userData[field] === undefined
  //           ) {
  //             updates[field] = "";
  //           }
  //       }
  //     }
  //   }

  //   if (Object.keys(updates).length > 0) {
  //     await updateUserProfile(userId, updates);
  //   }
  // };

  return {
    updateUserProfile,
    getUserProfile,
    updateUserInterests,
    getUserInterests,
    updateUserBio,
    updateUserLanguages,
    setUserProfilePicture,
    // ensureUserFields,
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
