import { categoryFuncs } from "./contentServices";
import { tagFuncs } from "./contentServices";

export const initializeApp = async () => {
    const { initializeDefaultCategories } = categoryFuncs();
    const { initializeDefaultTags } = tagFuncs();
    await initializeDefaultCategories();
    await initializeDefaultTags();
};