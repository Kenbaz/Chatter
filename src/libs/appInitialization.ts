import { tagFuncs } from "./contentServices";

export const initializeApp = async () => {
    const { initializeDefaultTags } = tagFuncs();
    await initializeDefaultTags();
};