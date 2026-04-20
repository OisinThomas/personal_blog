import Link from "next/link";
import Footer from "@/components/Footer";
export default function Home() {
  return (
    <div>
      <main className="container mx-auto px-4 mb-16 max-w-3xl">
        <p className="text-xl mb-8">
          Getting lost down a rabbit hole of good content is one of the greatest
          intellectual experiences. Here are some of my favourite blogs.
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
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Simon Willison's Blog
                </Link>
              </li>
              <li>
                <Link
                  href={"https://www.notboring.co/"}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Not Boring (Packy McCormick)
                </Link>
              </li>
              <li>
                <Link
                  href={"https://www.swyx.io/"}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Swyx's Blog
                </Link>
              </li>
              <li>
                <Link
                  href={"https://alexdanco.com/"}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Alex Danco's Blog
                </Link>
              </li>
              <li>
                <Link
                  href={"https://overreacted.io/"}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Dan Abramov's Blog
                </Link>
              </li>
              <li>
                <Link
                  href={"https://jamesclear.com/"}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  James Clear's Blog
                </Link>
              </li>
              <li>
                <Link
                  href={"https://www.benkuhn.net/"}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Ben Kuhn's Blog
                </Link>
              </li>
              <li>
                <Link
                  href={"https://www.thefitzwilliam.com/"}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  The Fitzwilliam
                </Link>
              </li>
              <li>
                <Link
                  href={"https://www.thediff.co/"}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  The Diff
                </Link>
              </li>
              <li>
                <Link
                  href={"https://www.gwern.net/"}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Gwern Branwen's Blog
                </Link>
              </li>
              <li>
                <Link
                  href={"https://paulgraham.com/articles.html"}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Paul Graham's Essays
                </Link>
              </li>
              <li>
                <Link
                  href={"https://michaelnielsen.org/"}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Michael Nielson's Blog
                </Link>
              </li>
              <li>
                <Link
                  href={"https://danielmiessler.com/"}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Daniel Miessler's Blog
                </Link>
              </li>
              <li>
                <Link
                  href={"https://jalammar.github.io/"}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Jay Alammar's Blog
                </Link>
              </li>
              <li>
                <Link
                  href={"https://marginalrevolution.com/"}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
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
