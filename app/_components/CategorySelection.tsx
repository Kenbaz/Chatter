'use client';

import { useState, FC, useEffect } from "react";
import { categoryFuncs, Category } from "@/src/libs/contentServices";
import { Profile } from "@/src/libs/userServices";
import { useRequireAuth } from "@/src/libs/useRequireAuth";
import { useRouter } from "next/navigation";


const CategorySelection: FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { user } = useRequireAuth();
  const router = useRouter();

  const { updateUserPreferredCategories } = Profile();

  useEffect(() => {
    const fetchCategories = async () => {
      const { getCategories } = categoryFuncs();
      const allCategories = await getCategories();
      setCategories(allCategories);
    };

    fetchCategories();
  }, []);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]);
  };

  const handleSave = async () => {
    if (user) {
      await updateUserPreferredCategories(user.uid, selectedCategories)
      // router.push("");
    }
  };

  return (
    <div>
      <h2>Select Your Preferred Categories</h2>
      {categories.map((category) => (
        <label key={category.id}>
          <input
            type="checkbox"
            checked={selectedCategories.includes(category.id)}
            onChange={() => handleCategoryToggle(category.id)}
          />
          {category.name}
        </label>
      ))}
      <button onClick={handleSave}>Save Preferences</button>
    </div>
  );
};

export default CategorySelection;