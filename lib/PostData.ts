import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface PostFrontMatter {
    title: string;
    description: string;
    updatedAt: string;
    publishedAt: string;
    author: string;
    image: string;
    majorTag: string;
    subTag: string;
    language: string;
    tags: string[];
    available?: boolean;
    [key: string]: any;  // To allow for any additional fields in the front matter
  }
  
  export interface Post extends PostFrontMatter {
    content: string;
    slug: string;
  }
  
  export function getAllPosts(): Post[] {
    const postsDirectory = path.join(process.cwd(), '_posts');
    const filenames = fs.readdirSync(postsDirectory);
  
    return filenames
      .filter((filename): filename is string => filename.endsWith('.md')) // Exclude non-markdown files
      .map((filename): Post => {
        const filePath = path.join(postsDirectory, filename);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContents);
        return {
          ...(data as PostFrontMatter),
          content,
          slug: filename.replace('.md', ''),
        };
      })
      .filter((post): post is Post => post.available !== false) // Only include available posts
      .sort((post1, post2) => new Date(post2.publishedAt).getTime() - new Date(post1.publishedAt).getTime());
  }