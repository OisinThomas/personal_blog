import Image from 'next/image'
import React from 'react'
import profileCharacter from "@/public/profile.png"
import LinkedIn from "@/components/Header/LinkedIn";
import Github from "@/components/Header/Github";
import XLogo from "@/components/Header/XLogo";

const AboutCoverSection = () => {
    return (
        <section className='w-full md:h-[66vh] flex flex-col md:flex-row items-center justify-center text-dark dark:text-light'>
            <div className='w-full md:w-1/2 h-full flex justify-center'>
                <Image src={profileCharacter} alt="CodeBucks"
                    className='w-4/5  xs:w-3/4 md:w-full h-full object-contain object-center'
                    priority
                    sizes="(max-width: 640px) 100vw,(max-width: 1180px) 50vw, 50vw"
                />
            </div>

            <div className='w-full md:w-1/2 flex flex-col text-left items-start justify-center px-5 xs:p-10 pb-10 lg:px-16'>
                <h2 className='font-bold capitalize text-4xl xs:text-5xl sxl:text-6xl  text-center lg:text-left'>
                    Hi, I’m Oisín Thomas.
                </h2>
                <p className='font-medium mt-4 text-base'>
                    Language enthusiast and co-founder of <a href="https://weeve.ie">Weeve</a>, the ed-tech language learning startup, where I am currently CTO.
                </p>
                <p>
                    I have previously worked in the ed-tech space with the Phonetics & Speech Laboratory at Trinity College Dublin, as part of ABAIR, where I helped develop an app for Irish language pronunciation for children (beta) and developed the first Irish-language AAC system on the CoughDrop open-source platform.
                </p>
                <p>
                    In my spare time, you can usually find me playing with languages – currently Irish, German, Spanish and Japanese – or reading with a coffee in hand. I believe that the intersection of technology and language has the ability to completely change the world.
                </p>
                <br />
                <p>
                    Reach me using the socials below or <b>oisin [at] weeve [dot] ie</b>!
                </p>
                <div className="flex ">
                    <a href="https://www.linkedin.com/in/oisin-thomas-morrin" className="mr-3"><LinkedIn className="m-2 hover:scale-125 transition-all ease duration-200" /></a>
                    <a href="https://twitter.com/oisin_thomas" className="mr-3"><XLogo className="m-2 hover:scale-125 transition-all ease duration-200" /></a>
                    <a href="https://github.com/OisinThomasMorrin" className="mr-3"><Github className="m-2 hover:scale-125 transition-all ease duration-200" /></a>
                </div>

            </div>
        </section >
    )
}

export default AboutCoverSection