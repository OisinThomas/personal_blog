import Link from 'next/link'
import React from 'react'
import BlogElement from '../Blog/BlogElement'
import LinkedIn from "@/components/Header/LinkedIn";
import Github from "@/components/Header/Github";
import XLogo from "@/components/Header/XLogo";
const RecentPosts = ({ blogs }: { blogs: any }) => {

    const groupedBlogs = blogs.reduce((acc: any, blog: any) => {
        // This assumes each blog entry has exactly one of tag1, tag2, tag3 defined
        const tags = ['Thoughts', 'Translations', 'Tinkering']; // Define the order of tags
        const tag = tags.find(tag => tag === blog.majorTag); // Find which tag this blog has

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
        <section className="max-w-[120ch] text-lg px-5 flex flex-col items-center justify-center">
            <h5 className="text-2xl sm:text-2xl md:text-2xl font-bold text-center mb-8">About Me</h5>
            <p className="text-md sm:text-md md:text-md font-semibold text-center mb-8">Co-founder of <a href="https://weeve.ie" className="underline"> Weeve</a>. Full-stack Dev at <a href="https://examfly.com" className="underline">Examfly</a>. </p>
            <p className="max-w-[70ch] text-center">
                In my spare time, you can usually find me playing with languages – currently Irish and Japanese – or reading with a coffee (or tea) in hand. I believe that the intersection of technology and language has the ability to completely change the world.
            </p>
            <br />
            <p>
                Reach me on (<a className="underline"
                    href="https://www.linkedin.com/in/oisin-thomas-morrin">LinkedIn</a> or <a className='underline' href="https://twitter.com/oisin_thomas">X</a>)!
            </p>
            <p>
                or email me at:
            </p>
            <p>
                oisin [dot] thomas [dot] morrin [at] gmail [dot] com
            </p>
            <br />

            <p className="text-md sm:text-md md:text-md text-center mb-8">Here are some of the <a className="underline" href="/favourite/content">content</a> and <a className="underline" href="/favourite/words">words</a> that have impacted me over the years</p>

            <p className="text-xl sm:text-xl md:text-xl font-semibold text-center">Below are my thoughts, translations and tinkerings</p>
            <br />
            {
                // list of blogs grouped by majorTag, with the date then language and title of each post
            }
            <div>
                {Object.keys(groupedBlogs).map(tag => (
                    <div key={tag} className="mt-2">
                        <h2 className="text-xl sm:text-xl md:text-xl font-bold text-left mb-4 mt-4">{tag}:</h2>
                        <div className="grid grid-cols-1 gap-4">
                            {groupedBlogs[tag].map((blog: any) => (
                                <Link key={blog.title} href={blog.url}>
                                    <div className="flex flex-row items-center p-2 bg-white shadow-md rounded-md hover:bg-gray-100">
                                        <div className="flex flex-row">
                                            <div className="w-[100px] h-fit rounded-md font-semibold bg-lightblue-100">
                                                {blog.updatedAt.replaceAll("-", ".").split("T")[0]}
                                            </div>
                                            <div className={`w-[30px] h-fit rounded-md font-semibold text-white ml-[5px] mr-[5px] text-center ${blog.language === "en" ? 'none' : 'bg-green-600'}`}>
                                                {blog.language === "en" ? 'EN' : 'GA'}
                                            </div>
                                        </div>

                                        <div
                                            className="flex-grow pl-2 text-left overflow-hidden"
                                            style={{
                                                hyphens: 'auto',
                                                wordWrap: 'break-word',
                                                overflowWrap: 'break-word',
                                                WebkitHyphens: 'auto', // For Safari
                                                msHyphens: 'auto', // For Internet Explorer
                                            }}
                                            lang="en" // Specify the language for better hyphenation (if applicable)
                                        >
                                            {blog.title}
                                        </div>

                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}

            </div>

        </section>
    )
}

export default RecentPosts