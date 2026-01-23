import Link from "next/link";
import Socials from "@/components/Socials";
import SubstackIcon from "@/components/icons/SubstackIcon";

export default function About() {
  return (
    <div className="h-fit">
      <main className="container mx-auto px-4 max-w-3xl">
        <div className="text-xl mb-8">
          <p>I'm Oisín Thomas!</p>
          <br />
          <p>
            Head of AI at{" "}
            <Link
              href={"https://www.examfly.com"}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Examfly
            </Link>{" "}
            and formerly co-founder/CTO of {" "}
            Weeve
            . I primarily focus on RnD and building the AI engine
            behind the products. Education, language and technology are my
            passions. My central raison d'être is to build tools that <Link href={"/blog/reducing-the-activation-energy-for-greatness"}
            className="text-blue-600 dark:text-blue-400 hover:underline"
            >make
            greatness default</Link>.
          </p>
          <br />
          <p>
            I have a 1st Class degree in Computer Science, Linguistics and Irish
            from Trinity College Dublin. I have worked on a number of interesting projects ranging from
            childrens' early learning applications for the Irish Language with{" "}
            <Link
              href={"https://www.abair.ie"}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ABAIR
            </Link>{" "}
            as well as creating book pipelines, an app and a chrome extension as
            a co-founder of the NDRC backed ed-tech startup,{" "}
            Weeve
            .{" "}
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
            in Irish. I have previously done some contract work in the
            translation sector, but I enjoy the freedom and challenge of fiction
            more entertaining.
          </p>
          <br />
          <p>You can contact me at oisin [dot] thomas99 [at] gmail [dot] com or read my <Link href="https://caideiseach.substack.com/" className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center">Substack <SubstackIcon className="w-5 h-5 ml-1" /></Link>.</p>
          <br />
          <p>Or find me below:</p>
          <br />
          <Socials />
        </div>
      </main>
    </div>
  );
}
