import algoliasearch from "algoliasearch";

export const algoliaSearrchClient = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
    process.env.NEXT_PUBLIC_ALGOLIA_ADMIN_API_KEY!
);

export const algoliaPostsIndex = algoliaSearrchClient.initIndex('Posts');