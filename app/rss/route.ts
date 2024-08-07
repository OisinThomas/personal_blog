import RSS from 'rss';
import { headers } from 'next/headers';
import { getAllPosts } from '@/lib/PostData';
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
