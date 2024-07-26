'use client'

import { FC, useEffect, useState } from 'react';
import Link from 'next/link';
import { postFuncs } from '@/src/libs/contentServices';
import { Category } from '@/src/libs/contentServices';
import { useRequireAuth } from '@/src/libs/useRequireAuth';

interface CategoryWithCount extends Category {
    postCount: number
}

const CategoryNavigation: FC = () => {
    const { getCategoriesWithPostCounts } = postFuncs();
    
    const [categories, setCategories] = useState<CategoryWithCount[]>([]);
    const { user } = useRequireAuth();

    useEffect(() => {
        const fetchCategories = async () => {
            if (user) {
                const categoriesWithCounts = await getCategoriesWithPostCounts(user.uid);
                setCategories(categoriesWithCounts);
            }
        };

        fetchCategories();
    }, [user, getCategoriesWithPostCounts]);

    return (
        <nav>
            <ul>
                <li>
                    <Link href="/for-you">
                        <a>For You</a>
                    </Link>
                </li>
                {categories.map(category => (
                    <li key={category.id}>
                        <Link href={`/category/${category.id}`}>
                            <a>{category.name} ({category.postCount})</a>
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    )
   
};

export default CategoryNavigation;