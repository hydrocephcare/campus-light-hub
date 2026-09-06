import glorySermonPost from "./manifestation-of-the-glory-of-god.json";
import sermonPost from "./manifesting-the-presence-of-the-lord.json";
import welcomePost from "./welcome-to-mku-cu.json";

export interface PublishedBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  category: string | null;
  tags: string[] | null;
  is_published: boolean | null;
  published_at: string | null;
  created_at: string | null;
}

export const builtInBlogPosts: PublishedBlogPost[] = [
  {
    ...glorySermonPost,
    id: `built-in:${glorySermonPost.slug}`,
    created_at: glorySermonPost.published_at,
  },
  {
    ...welcomePost,
    id: `built-in:${welcomePost.slug}`,
    created_at: welcomePost.published_at,
  },
  {
    ...sermonPost,
    id: `built-in:${sermonPost.slug}`,
    featured_image: "/images/blog/manifesting-the-presence-of-the-lord.jpg",
    created_at: sermonPost.published_at,
  },
];

export const mergePublishedBlogPosts = <T extends PublishedBlogPost>(remotePosts: T[]) => {
  const posts = new Map<string, PublishedBlogPost>();

  for (const post of builtInBlogPosts) posts.set(post.slug, post);
  for (const post of remotePosts) posts.set(post.slug, post);

  return [...posts.values()].sort((a, b) =>
    (b.published_at || b.created_at || "").localeCompare(a.published_at || a.created_at || ""),
  );
};

export const findBuiltInBlogPost = (slug: string) =>
  builtInBlogPosts.find((post) => post.slug === slug) || null;
