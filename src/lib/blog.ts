import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

const contentDirectory = path.join(process.cwd(), 'content/blog');

export interface BlogPostFrontmatter {
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  locale: string;
  image?: string;
  imageAlt?: string;
}

export interface BlogPost {
  slug: string;
  frontmatter: BlogPostFrontmatter;
  content: string;
  readingTime: string;
}

/**
 * Get all blog posts, optionally filtered by locale
 */
export function getAllPosts(locale?: string): BlogPost[] {
  // Ensure content directory exists
  if (!fs.existsSync(contentDirectory)) {
    return [];
  }

  const files = fs.readdirSync(contentDirectory);

  const posts = files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const slug = file.replace('.mdx', '');
      return getPostBySlug(slug);
    })
    .filter((post): post is BlogPost => post !== null);

  // Filter by locale if specified
  const filteredPosts = locale
    ? posts.filter((post) => post.frontmatter.locale === locale)
    : posts;

  // Sort by date (newest first)
  return filteredPosts.sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime()
  );
}

/**
 * Get a single blog post by slug
 */
export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(contentDirectory, `${slug}.mdx`);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const frontmatter = data as BlogPostFrontmatter;

    // Calculate reading time
    const stats = readingTime(content);

    return {
      slug,
      frontmatter,
      content,
      readingTime: stats.text,
    };
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

/**
 * Get related posts based on tags
 */
export function getRelatedPosts(
  currentSlug: string,
  currentTags: string[],
  locale: string,
  limit: number = 3
): BlogPost[] {
  const allPosts = getAllPosts(locale);

  // Filter out current post
  const otherPosts = allPosts.filter((post) => post.slug !== currentSlug);

  // Calculate relevance score based on shared tags
  const postsWithScore = otherPosts.map((post) => {
    const sharedTags = post.frontmatter.tags.filter((tag) =>
      currentTags.includes(tag)
    );
    return {
      post,
      score: sharedTags.length,
    };
  });

  // Sort by score (most relevant first) and return top results
  return postsWithScore
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.post);
}

/**
 * Get all unique tags across all posts
 */
export function getAllTags(locale?: string): string[] {
  const posts = getAllPosts(locale);
  const tagsSet = new Set<string>();

  posts.forEach((post) => {
    post.frontmatter.tags.forEach((tag) => tagsSet.add(tag));
  });

  return Array.from(tagsSet).sort();
}

/**
 * Get posts by tag
 */
export function getPostsByTag(tag: string, locale?: string): BlogPost[] {
  const posts = getAllPosts(locale);
  return posts.filter((post) => post.frontmatter.tags.includes(tag));
}
