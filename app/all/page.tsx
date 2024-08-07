import Link from "next/link";
import { getAllPosts } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  const AllBlogs = getAllPosts();

  const groupedBlogs = AllBlogs.reduce((acc: any, blog: any) => {
    // This assumes each blog entry has exactly one of tag1, tag2, tag3 defined
    const tags = ['Thoughts', 'Translations', 'Tinkering']; // Define the order of tags
    const tag = tags.find(tag => tag === blog.majorTag); // Find which tag this blog has
    acc = tags.reduce((acc: any, tag: string) => {
        if (!acc[tag]) {
            acc[tag] = [];
        }
        return acc;
    }, acc); // Initialize each tag as an empty array
    if (tag) {
        const tagName = blog.majorTag; // Get the actual tag name (value of tag1, tag2, or tag3)
        if (!acc[tagName]) {
            acc[tagName] = [];
        }
            acc[tagName].push(blog); // Group blog names by their tag
        
    }
    return acc;
}, {});

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <Header />

      <main className="container mx-auto px-4 mb-16 w-2/3">
        <div className="flex flex-col-reverse gap-8 md:flex-row">
          <div className="md:w-2/3 md:pr-8 mb-8 md:mb-0">
          {Object.keys(groupedBlogs).map(tag => (
                    <div key={tag} className="mt-2">
                        <h2 className="text-xl sm:text-xl md:text-xl font-bold text-left mb-4 mt-4">{tag}:</h2>
                        <div className="grid grid-cols-1 gap-4">
                            {groupedBlogs[tag].map((blog: any) => (
                                <Link key={blog.title} href={`/blog/${blog.slug}`}>
                                        <div
                                            className="flex-grow pl-2 text-left "
                                            style={{
                                                hyphens: 'auto',
                                                wordWrap: 'break-word',
                                                overflowWrap: 'break-word',
                                                WebkitHyphens: 'auto', // For Safari
                                                msHyphens: 'auto', // For Internet Explorer
                                                cursor: 'pointer', 
                                                textDecoration: 'underline',
                                            }}
                                            lang={blog.language} // Specify the language for better hyphenation (if applicable)
                                        >
                                            {blog.title} {blog.language === 'ga' ? `[${blog.language.toUpperCase()}]` : ''}
                                        </div>
                                        <p>{blog.tags.map((tag: string) => `• ${tag}`).join(" ")}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
          </div>

        </div>
      </main>

        <Footer />
    </div>
  );
}
