import RSS from 'rss';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { headers } from 'next/headers';

export async function GET(request: Request): Promise<Response> {
  const headersList = headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const site_url = `${protocol}://${host}`;

  const feedOptions = {
    title: "Oisín Thomas",
    description: "A smorgasbord of thoughts, tinkerings and translations",
    site_url: site_url,
    feed_url: `${site_url}/rss.xml`,
    image_url: `${site_url}/profile.png`,
    pubDate: new Date(),
    copyright: `All rights reserved ${new Date().getFullYear()}, Oisín Thomas`,
  };

  const feed = new RSS(feedOptions);

  const posts = getAllPosts();

  posts.forEach((post) => {
    feed.item({
      title: post.title,
      description: post.description,
      url: `${site_url}/blog/${post.slug}`,
      date: new Date(post.publishedAt),
      author: post.author,
      categories: [post.majorTag, post.subTag, ...post.tags],
      custom_elements: [
        { language: post.language },
        { 'dc:creator': post.author },
      ],
    });
  });

  return new Response(feed.xml({ indent: true }));
}

interface PostFrontMatter {
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

interface Post extends PostFrontMatter {
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