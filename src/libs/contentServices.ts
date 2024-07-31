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
  getDoc,
  startAfter,
  startAt,
  endAt,
} from "firebase/firestore";
import { Profile } from "./userServices";
import { firestore } from "./firebase";
import { getCategoryForTags } from "./tagCategoryMapping";

export interface Category {
  id: string;
  name: string;
}

export interface PostData {
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
  "React Native",
  "Flutter",
  "Artificial Intelligence(AI)",
  "Work",
  "Software Engineering",
  "Software Development",
  "Freelancing",
  "Programming",
  "Game Dev",
  "Data Science",
  "Health",
  "Technology",
  "Computer Science",
  "Database",
  "Coding",
  "Career",
  "Cloud Engineering",
  "Cyber Security",
  "Tutorial",
  "Git",
  "Mobile development",
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
  "Freelancing",
  "Sql",
  "Mongodb",
];

export const categoryFuncs = () => {
  const initializeDefaultCategories = async () => {
    try {
      const categoriesRef = collection(firestore, "Categories");
      const existingCategories = await getCategories();
      if (existingCategories.length === 0) {
        for (const categoryName of defaultCategories) {
          await addCategory(categoryName);
        }
        console.log("Default categories initialized");
      }
    } catch (error) {
      console.error("Error initializing categories:", error);
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
  const getPostsByCategory = async (
    categoryId: string,
    pageSize = 10,
    lastPostId?: string,
    filters?: {
      sortBy: 'recent' | 'popular',
      dateRange: 'all' | 'today' | 'thisWeek' | 'thisMonth'
    }
  ) => {
    const postsRef = collection(firestore, "Posts");
    let q = query(
      postsRef,
      where("status", "==", "published"),
      where("categoryId", "==", categoryId),
    );

    const getDateFilter = (dateRange: string) => {
      const now = new Date();
      switch (dateRange) {
        case "today":
          return new Date(now.setHours(0, 0, 0, 0));
        case "thisWeek":
          return new Date(now.setDate(now.getDate() - 7));
        case "thisMonth":
          return new Date(now.setMonth(now.getMonth() - 1));
        default:
          return new Date(0);
      }
    };

    // Apply date range filter
    if (filters?.dateRange !== 'all' && filters?.dateRange !== undefined) {
      const dateFilter = getDateFilter(filters?.dateRange);
      q = query(q, where("createdAt", "==", dateFilter));
    };

    // Apply sorting
    if (filters?.sortBy === 'popular') {
      q = query(q, orderBy("likes", "desc"));
    } else {
      q = query(q, orderBy("createdAt", "desc"));
    }

    q = query(q, limit(pageSize * 3));

    if (lastPostId) {
      const lastPostDoc = await getDoc(doc(firestore, "Posts", lastPostId));
      q = query(q, startAfter(lastPostDoc));
    }

    const querySnapshot = await getDocs(q);
    const allPosts = querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as PostData)
    );

    // Filter posts by category
    const categoryPosts = allPosts
      .filter((post) => getCategoryForTags(post.tags) === categoryId)
      .slice(0, pageSize);

    return categoryPosts.map((post) => ({
      id: post.id,
      title: post.title,
      tags: post.tags,
      content: post.content,
      authorId: post.authorId,
      status: post.status,
      coverImage: post.coverImage,
      updatedAt: post.updatedAt,
      createdAt: post.createdAt,
      categoryId: post.categoryId,
    }));
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
      query(collection(firestore, "Posts"), where("status", "==", "published"))
    );

    const postCounts: Record<string, number> = {};

    postsSnapshot.docs.forEach((doc) => {
      const post = doc.data() as PostData;
      const category = getCategoryForTags(post.tags);
      postCounts[category] = (postCounts[category] || 0) + 1;
    });

    return categories.map((category) => ({
      ...category,
      postCount: postCounts[category.id] || 0,
    }));
  };

   const getPostsByAuthor = async (
     authorId: string,
     pageSize: number = 5,
     lastPostId?: string | null
   ): Promise<PostData[]> => {
     const postsRef = collection(firestore, "Posts");
     let q = query(
       postsRef,
       where("authorId", "==", authorId),
       where("status", "==", "published"),
       orderBy("createdAt", "desc"),
       limit(pageSize)
     );

     if (lastPostId) {
       const lastPostDoc = await getDoc(doc(firestore, "Posts", lastPostId));
       q = query(q, startAfter(lastPostDoc));
     }

     const querySnapshot = await getDocs(q);
     return querySnapshot.docs.map(
       (doc) => ({ id: doc.id, ...doc.data() } as PostData)
     );
  };
  
  const searchPosts = async (searchQuery: string, limitCount = 5): Promise<PostData[]> => {
    const postsRef = collection(firestore, 'Posts');
    const q = query(
      postsRef,
      where("status", "==", "published"),
      orderBy("title"),
      startAt(searchQuery.toLowerCase()),
      endAt(searchQuery.toLowerCase() + "\uf8ff"),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as PostData)
    );
  };

  const getPostById = async (postId: string): Promise<PostData | null> => {
    try {
      const postDoc = await getDoc(doc(firestore, "Posts", postId));
      if (postDoc.exists()) {
        return { id: postDoc.id, ...postDoc.data() } as PostData;
      } else {
        console.error("No such post");
        return null;
      }
    } catch (error) {
      console.error("Error fetching post by ID:", error);
      return null;
    }
  };

  return { getPostsByCategory, getCategoriesWithPostCounts, getPostsByAuthor, searchPosts, getPostById };
};

export const feeds = () => {

  const getPersonalizedFeed = async (
    userId: string,
    pageSize = 10,
    lastPostId?: string,
    filters?: {
      sortBy: "recent" | "popular";
      dateRange: "all" | "today" | "thisWeek" | "thisMonth";
    }
  ) => {
    const { getUserInterests } = Profile();

    const userInterests = await getUserInterests(userId);
    const postsRef = collection(firestore, "Posts");
    let q = query(
      postsRef,
      where("tags", "array-contains-any", userInterests),
      where("status", "==", "published"),
    );

    const getDateFilter = (dateRange: string) => {
      const now = new Date();
      switch (dateRange) {
        case "today":
          return new Date(now.setHours(0, 0, 0, 0));
        case "thisWeek":
          return new Date(now.setDate(now.getDate() - 7));
        case "thisMonth":
          return new Date(now.setMonth(now.getMonth() - 1));
        default:
          return new Date(0);
      }
    };

    // Apply date range filter
    if (filters?.dateRange !== "all" && filters?.dateRange !== undefined) {
      const dateFilter = getDateFilter(filters?.dateRange);
      q = query(q, where("createdAt", "==", dateFilter));
    }

    // Apply sorting
    if (filters?.sortBy === "popular") {
      q = query(q, orderBy("likes", "desc"));
    } else {
      q = query(q, orderBy("createdAt", "desc"));
    }

    q = query(q, limit(pageSize));

    if (lastPostId) {
      const lastPostDoc = await getDoc(doc(firestore, "Posts", lastPostId));
      q = query(q, startAfter(lastPostDoc));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title,
      tags: doc.data().tags,
      content: doc.data().content,
      authorId: doc.data().authorId,
      status: doc.data().status,
      coverImage: doc.data().coverImage,
      updatedAt: doc.data().updatedAt,
      createdAt: doc.data().createdAt,
      categoryId: doc.data().categoryId,
    }));
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

  const getPostsByTag = async (
    tag: string,
    pageSize = 10,
    lastPostId?: string
  ): Promise<PostData[]> => {
    const postsRef = collection(firestore, "Posts");
    let q = query(
      postsRef,
      where("tags", "array-contains", tag.toLowerCase()),
      where("status", "==", "published"),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    if (lastPostId) {
      const lastPostDoc = await getDoc(doc(firestore, "Posts", lastPostId));
      q = query(q, startAfter(lastPostDoc));
    }

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
