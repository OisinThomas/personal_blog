import Link from "next/link";
import Socials from "@/components/Socials";
import SubstackIcon from "@/components/icons/SubstackIcon";

export default function About() {
  return (
    <div className="h-fit">
      <main className="container mx-auto px-4 w-2/3">
        <div className="text-xl mb-8">
          <p>I'm Oisín Thomas!</p>
          <br />
          <p>
            Co-founder of{" "}
            <Link
              href={"https://www.weeve.ie"}
              className="cursor-pointer underline"
            >
              Weeve
            </Link>{" "}
            and Fullstack Dev at{" "}
            <Link
              href={"https://www.examfly.com"}
              className="cursor-pointer underline"
            >
              Examfly
            </Link>
            . I primarily focus on RnD and building the AI engine
            behind the products. Education, language and technology are my
            passions. My central raison d'être is to build tools that <Link href={"/blog/reducing-the-activation-energy-for-greatness"} 
            className="underline cursor-pointer"
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
              className="underline cursor-pointer"
            >
              ABAIR
            </Link>{" "}
            as well as creating book pipelines, an app and a chrome extension as
            a co-founder of the NDRC backed ed-tech startup,{" "}
            <Link
              href={"https://www.weeve.ie"}
              className="cursor-pointer underline"
            >
              Weeve
            </Link>
            .{" "}
          </p>
          <br />
          <p>
            In my free time I like to translate, recently translating and publishing{" "}
            <Link
              href={"https://www.amazon.co.uk/dp/1068608714/"}
              className="cursor-pointer underline"
            >
              Winnie-the-Pooh
            </Link>{" "}
            in Irish. I have previously done some contract work in the
            translation sector, but I enjoy the freedom and challenge of fiction
            more entertaining.
          </p>
          <br />
          <p>You can contact me at oisin [dot] thomas99 [at] gmail [dot] com or read my <Link href="https://caideiseach.substack.com/" className="underline inline-flex items-center">Substack <SubstackIcon className="w-5 h-5 ml-1" /></Link>.</p>
          <br />
          <p>Or find me below:</p>
          <br />
          <Socials />
        </div>
      </main>
    </div>
  );
}
