import Link from "next/link";
import { getAllPosts } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
export default function Home() {
  const AllBlogs = getAllPosts();

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 mb-16 w-2/3">
        <div className="flex flex-col md:flex-row justify-around items-center p-4">
          <div className="relative h-[140px] w-full md:w-auto flex items-center justify-center mb-4 md:mb-0 md:mr-20">
            <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 text-lg md:text-xl fadeInOut w-[1ch]">
              好奇心旺盛
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 text-lg md:text-xl text-center fadeInOutDelayed opacity-0">
              brimming with curiosity
            </div>
          </div>
          <div className="relative h-full max-w-[75ch] md:w-[30ch] flex text-sm md:text-lg italic wrap items-center justify-center">
            `Curiouser and curiouser!' cried Alice (she was so much surprised,
            that for the moment she quite forgot how to speak good English)
          </div>
        </div>

        <p className="text-xl mb-8">
          Getting lost down a rabbit hole of good content is one of the greatest
          intellectual experiences.
        </p>

        <p className="text-xl mb-8">
          Here are a list of some of my favourites blogs!
        </p>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/3 md:pr-8 mb-8 md:mb-0 text-xl">
            <ul
              className="
            list-disc
            list-inside
            space-y-2"
            >
              <li>
                <Link
                  href={"https://simonwillison.net/"}
                  className="cursor-pointer underline"
                >
                  Simon Willison's Blog
                </Link>
              </li>
              <li>
                <Link
                  href={"https://www.notboring.co/"}
                  className="cursor-pointer underline"
                >
                  Not Boring (Packy McCormick)
                </Link>
              </li>
              <li>
                <Link
                  href={"https://www.swyx.io/"}
                  className="cursor-pointer underline"
                >
                  Swyx's Blog
                </Link>
              </li>
              <li>
                <Link
                  href={"https://alexdanco.com/"}
                  className="cursor-pointer underline"
                >
                  Alex Danco's Blog
                </Link>
              </li>
              <li>
                <Link
                  href={"https://overreacted.io/"}
                  className="cursor-pointer underline"
                >
                  Dan Abramov's Blog
                </Link>
              </li>
              <li>
                <Link
                  href={"https://jamesclear.com/"}
                  className="cursor-pointer underline"
                >
                  James Clear's Blog
                </Link>
              </li>
              <li>
                <Link
                  href={"https://www.benkuhn.net/"}
                  className="cursor-pointer underline"
                >
                  Ben Kuhn's Blog
                </Link>
              </li>
              <li>
                <Link
                  href={"https://www.thefitzwilliam.com/"}
                  className="cursor-pointer underline"
                >
                  The Fitzwilliam
                </Link>
              </li>
              <li>
                <Link
                  href={"https://www.thediff.co/"}
                  className="cursor-pointer underline"
                >
                  The Diff
                </Link>
              </li>
              <li>
                <Link
                  href={"https://www.gwern.net/"}
                  className="cursor-pointer underline"
                >
                  Gwern Branwen's Blog
                </Link>
              </li>
              <li>
                <Link
                  href={"https://paulgraham.com/articles.html"}
                  className="cursor-pointer underline"
                >
                  Paul Graham's Essays
                </Link>
              </li>
              <li>
                <Link
                  href={"https://michaelnielsen.org/"}
                  className="cursor-pointer underline"
                >
                  Michael Nielson's Blog
                </Link>
              </li>
              <li>
                <Link
                  href={"https://danielmiessler.com/"}
                  className="cursor-pointer underline"
                >
                  Daniel Miessler's Blog
                </Link>
              </li>
              <li>
                <Link
                  href={"https://jalammar.github.io/"}
                  className="cursor-pointer underline"
                >
                  Jay Alammar's Blog
                </Link>
              </li>
              <li>
                <Link
                  href={"https://marginalrevolution.com/"}
                  className="cursor-pointer underline"
                >
                  Marginal Revolution
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
