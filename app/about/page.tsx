import Link from "next/link";

import SubstackIcon from "@/components/icons/SubstackIcon";
import Footer from "@/components/Footer";

export default function About() {
  return (
    <div className="h-fit">
      <main className="container mx-auto px-4 max-w-3xl">
        {/* Animated curiosity element */}
        <div className="flex flex-col md:flex-row justify-around items-center p-4 mb-8">
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

        <div className="text-xl mb-8">
          <p>
            <span className="text-primary font-semibold">caidéiseach</span>{" "}
            comes from the Irish <span className="italic">cad é seo?</span>—"what is this?"—said
            over and over. In Japanese, the same asymptotic inquisitiveness is{" "}
            <span className="italic">好奇心旺盛</span> (koukishinousei)—brimming with curiosity.
          </p>
          <br />
          <p>
            Gaelfuturist, startup builder, and autodidact. My central raison d'être is to build tools that{" "}
            <Link href={"/blog/reducing-the-activation-energy-for-greatness"}
            className="text-blue-600 dark:text-blue-400 hover:underline"
            >make greatness default</Link>.
          </p>
          <br />
          <p>
            In my free time I like to translate, recently translating and publishing{" "}
            <Link
              href={"https://www.amazon.co.uk/dp/1068608714/"}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Winnie-the-Pooh
            </Link>{" "}
            in Irish.
          </p>
          <br />
          <p>You can read my <Link href="https://caideiseach.substack.com/" className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center">Substack <SubstackIcon className="w-5 h-5 ml-1" /></Link>.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
