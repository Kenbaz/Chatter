import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  FieldValue,
  Timestamp,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { Profile } from "./userServices";
import { firestore } from "./firebase";
import { profile } from "console";

export interface Category {
  id: string;
  name: string;
}

interface PostData {
  id: string;
  title: string;
  tags: string[];
  content: string;
  authorId: string;
  status: "published | draft";
  coverImage: string;
  updatedAt: string | FieldValue | Timestamp;
  createdAt?: string | FieldValue;
  categoryId: string;
}

const defaultCategories = [
  "Web development",
  "JavaScript",
  "TypeScript",
  "Python",
  "Nodejs",
  "React",
  "Vue",
  "Design",
  "UX",
  "Artificial Intelligence",
  "Work",
  "Software Engineering",
  "Software Development",
  "Freelancing",
  "Programming",
  "Business",
  "Science",
  "Health",
  "Technology",
  "Arts",
  "Education",
  "Entertainment",
  "Coding",
  "Career",
];

const defaultTags = [
  "JavaScript",
  "TypeScript",
  "React",
  "Vue",
  "Angular",
  "Node.js",
  "Python",
  "Java",
  "C#",
  "PHP",
  "CSS",
  "HTML",
  "DevOps",
  "AI",
  "Machine Learning",
  "Data Science",
  "Mobile Development",
  "iOS",
  "Android",
  "Cloud Computing",
  "AWS",
  "Azure",
  "Google Cloud",
  "Docker",
  "Kubernetes",
  "Blockchain",
  "Cybersecurity",
  "UI/UX",
  "Design",
  "Product Management",
  "Gamedev",
  "Design",
  "Django",
  "Tutorial",
  "Beginners",
  "Learning",
  "Computer science",
  "Firebase",
  "Database",
  "Tailwindcss",
  "Career",
  "Interview",
  "Git",
  "React Native",
  "Flutter",
  "Frontend",
  "Backend",
  "NextJs",
  "NuxtJs",
];

export const categoryFuncs = () => {
  const initializeDefaultCategories = async () => {
    const categoriesRef = collection(firestore, "Categories");
    const existingCategories = await getCategories();

    if (existingCategories.length === 0) {
      for (const categoryName of defaultCategories) {
        await addCategory(categoryName);
      }
      console.log("Default categories initialized");
    }
  };

  const addCategory = async (name: string): Promise<string> => {
    const categoriesRef = collection(firestore, "Categories");
    const docRef = await addDoc(categoriesRef, {
      name,
    });
    return docRef.id;
  };

  const getCategories = async (): Promise<Category[]> => {
    const categoriesRef = collection(firestore, "Categories");
    const querySnapshot = await getDocs(categoriesRef);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Category)
    );
  };

  const updateCategory = async (
    categoryId: string,
    updates: Partial<Omit<Category, "id">>
  ) => {
    const categoryRef = doc(firestore, "Categories", categoryId);
    await updateDoc(categoryRef, { ...updates });
  };

  const deleteCategory = async (categoryId: string) => {
    const categoryRef = doc(firestore, "Categories", categoryId);
    await deleteDoc(categoryRef);
  };

  return {
    initializeDefaultCategories,
    addCategory,
    getCategories,
    updateCategory,
    deleteCategory,
  };
};

export const postFuncs = () => {
  const getPostsByCategory = async (categoryId: string, pageSize = 10) => {
    const postsRef = collection(firestore, "Posts");
    const q = query(
      postsRef,
      where("categoryId", "==", categoryId),
      where("status", "==", "published"),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as PostData)
    );
  };

  const getCategoriesWithPostCounts = async (userId: string) => {
    const { getUserPreferredCategories } = Profile();

    const preferredCategoryIds = await getUserPreferredCategories(userId);

    const categoriesSnapshot = await getDocs(
      query(
        collection(firestore, "Categories"),
        where("__name__", "in", preferredCategoryIds)
      )
    );

    const categories = categoriesSnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Category)
    );

    const postsSnapshot = await getDocs(
      query(
        collection(firestore, "Posts"),
        where("categoryId", "in", preferredCategoryIds),
        where("status", "==", "published")
      )
    );

    const postCounts = postsSnapshot.docs.reduce((acc, doc) => {
      const post = doc.data() as PostData;
      acc[post.categoryId] = (acc[post.categoryId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return categories.map((category) => ({
      ...category,
      postCount: postCounts[category.id] || 0,
    }));
  };

  return { getPostsByCategory, getCategoriesWithPostCounts };
};

export const feeds = () => {
  const getPersonalizedFeed = async (userId: string, pageSize = 10) => {
    const { getUserInterests } = Profile();

    const userInterests = await getUserInterests(userId);
    const postsRef = collection(firestore, "Posts");
    const q = query(
      postsRef,
      where("tags", "array-contains-any", userInterests),
      where("status", "==", "published"),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  return { getPersonalizedFeed };
};

export const tagFuncs = () => {
  const initializeDefaultTags = async () => {
    const tagsRef = collection(firestore, "Tags");
    const existingTags = await getAllTags();

    if (existingTags.length === 0) {
      for (const tagName of defaultTags) {
        await addTag(tagName);
      }
      console.log("Default tags initialized", tagsRef);
    }
  };

  const addTag = async (name: string): Promise<string> => {
    const tagsRef = collection(firestore, "Tags");
    const docRef = await addDoc(tagsRef, { name });
    return docRef.id;
  };

  const getAllTags = async (): Promise<{ id: string; name: string }[]> => {
    const tagsRef = collection(firestore, "Tags");
    const querySnapshot = await getDocs(tagsRef);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
    }));
  };

  const getPostsByTag = async (tag: string, pageSize = 10) => {
    const postsRef = collection(firestore, "Posts");
    const q = query(
      postsRef,
      where("tags", "array-contains", tag.toLowerCase()),
      where("status", "==", "published"),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as PostData)
    );
  };

  const getTagNames = async (tagIds: string[]): Promise<string[]> => {
    const allTags = await getAllTags();
    const tagMap = new Map(allTags.map((tag) => [tag.id, tag.name]));
    return tagIds.map((id) => tagMap.get(id) || "");
  };

  return {
    initializeDefaultTags,
    addTag,
    getAllTags,
    getPostsByTag,
    getTagNames,
  };
};
