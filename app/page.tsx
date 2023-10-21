import { allBlogs } from "@/.contentlayer/generated"
import RecentPosts from "@/components/Home/RecentPosts"
import Footer from "@/components/Footer"
import { sortBlogs } from "@/utils"
export default function Home() {
  const sortedBlogs = sortBlogs(allBlogs)
  return (
    <main className="flex flex-col items-center justify-center">
      <div className="flex flex-col md:flex-row justify-around items-center p-4">
        <div className="relative h-[140px] w-full md:w-auto flex items-center justify-center mb-4 md:mb-0 md:mr-20">
          <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 text-lg md:text-xl fadeInOut w-[1ch]">
            好奇心旺盛
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 text-lg md:text-xl text-center fadeInOutDelayed opacity-0">
            brimming with curiosity
          </div>
        </div>
        <div className="relative h-full w-full md:w-[30ch] flex text-sm md:text-lg italic wrap items-center justify-center">
          `Curiouser and curiouser!' cried Alice (she was so much surprised, that for the moment she quite forgot how to speak good English)
        </div>
      </div>

      <RecentPosts blogs={sortedBlogs} />
      <Footer />
    </main>
  )
}
