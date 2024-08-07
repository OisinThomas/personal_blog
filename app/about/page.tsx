import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Socials from "@/components/Socials";

export default function About() {

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <Header />

      <main className="container mx-auto px-4 mb-16 w-2/3">
        <p className="text-xl mb-8">
            <p>
          I'm Oisín Thomas! 

            </p>
            <br/>
            <p>
          Co-founder of <Link href={'https://www.weeve.ie'} className='cursor-pointer underline'>Weeve</Link> and Fullstack Dev at <Link href={'https://www.examfly.com'} className='cursor-pointer underline'>Examfly</Link>
          </p>
          <br/>
          <p>
          Education, language and technology are my passions.

          </p>
          <br/>
          <p>
          You can contact me at oisin [dot] thomas99 [at] gmail [dot] com    

          </p>
          <br/>
          <p>
          Or find me below:

          </p>
            <br/>
          <Socials/>
        </p>
        
        
      </main>
    </div>
  );
}
