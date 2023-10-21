import Link from 'next/link'
import React from 'react'
import BlogElement from '../Blog/BlogElement'

const RecentPosts = ({ blogs }: { blogs: any }) => {
    return (
        <section className="w-full mt-16 sm:mt-12  md:mt-20 px-5 sm:px-10 md:px-24  sxl:px-32 flex flex-col items-center justify-center">

            <div className='w-full h-px bg-gray-300 dark:bg-gray-700 flex flex-row justify-between items-baseline'>
                <h2 className='inline-block font-bold capitalize text-4xl'>Recent Posts</h2>
                <Link href="/categories/all" className='inline-block font-medium text-black underline underline-offset-2 text-lg align-bottom'> view all </Link>
            </div>
            <div className={`grid grid-cols-3 grid-rows-{${String(Math.ceil(Math.max(3, Math.min(blogs.length, 9)) / 3))} gap-16 mt-16`}>
                {
                    blogs.slice(0, 9).map((blog, index) => {
                        return <article key={index} className='col-span-1 row-span-1 relative'>
                            <BlogElement blog={blog} />
                        </article>
                    })
                }
            </div>
        </section>
    )
}

export default RecentPosts