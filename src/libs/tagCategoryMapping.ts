export interface TagCategoryMap {
    [tag: string]: string;
}

export const tagCategoryMapping: TagCategoryMap = {
    'React': 'Web development',
    'Vue': 'Web development',
    'Angular': 'Web development' && 'Mobile development',
    'JavaScript': 'Programming' && 'Software Engineering',
    'Python': 'Programming' && 'Software Engineering',
    'TypeScript': 'Programming' && 'Software Engineering',
    'Node.Js': 'Programming' && 'Software Engineering',
    'Java': 'Programming' && 'Software Engineering',
    'C#': 'Programming' && 'Software Engineering',
    'PHP': 'Programming' && 'Software Engineering',
    'CSS': 'Web development',
    'HTML': 'Web development',
    "DevOps": 'Software development',
    "AI": 'Artificial Intelligence(AI)',
    "Machine Learning": 'Data Science',
    "Data Science": 'Data Science',
    "Mobile Development": 'React Native' && 'Flutter',
    "iOS": 'Software Engineering',
    "Android": 'Software Engineering',
    "AWS": 'Cloud Engineering',
    "Azure": 'Cloud Engineering',
    "Google Cloud": 'Cloud Engineering',
    "Docker": 'Software Development',
    "Kubernetes": 'Software Development',
    "Cybersecurity": 'Cyber Security',
    "UI/UX": 'Design' && 'UX',
    "Design": 'Design' && 'UX',
    "Product Management": 'Devops',
    "Gamedev": 'Game Dev',
    "Django": 'Web development',
    "Tutorial": 'Web development' && 'Tutorial',
    "Beginners": 'Tutorial' && 'Web development',
    "Learning": 'Tutorial' || 'Web development',
    "Computer science": 'Computer Science',
    "Firebase": 'Database',
    "Database": 'Database',
    "Tailwindcss": 'Design' && 'UX' && 'Web development',
    "Career": 'Work' && 'Career',
    "Interview": 'Work' && 'Career',
    "Git": 'Git',
    "React Native": 'Mobile development' && 'React Native',
    "Flutter": 'Mobile development' && 'Flutter',
    "Frontend": 'Web development' && 'Mobile development',
    "Backend": 'Web development' && 'Mobile development',
    "NextJs": 'Web development',
    "NuxtJs": 'Web development',
    "Freelancing": 'Freelancing',
    "Sql": 'Database',
  "Mongodb": 'Database',
};

export const getCategoryForTag = (tag: string): string => {
    return tagCategoryMapping[tag.toLowerCase()] || 'uncategorized';
};

export const getCategoryForTags = (tags: string[]): string => {
    for (const tag of tags) {
        const category = getCategoryForTag(tag);
        if (category !== 'uncategorized') {
            return category;
        }
    }
    return 'uncategorized';
};