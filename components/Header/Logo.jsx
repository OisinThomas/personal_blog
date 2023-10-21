import React from 'react'
import Link from "next/link"
import Image from "next/image"
import profileImg from  "@/public/profile.png"
const Logo = () => {
  return (
    <Link href="/" alt="home" className='flex items-center text-dark'>
        <div className='flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mr-4'>
        <Image src={profileImg} alt="oisin thomas" className='w-full h-auto rounded-full'/>
        </div>
        <span className='ml-3 text-xl font-bold'>Oisín Thomas</span>
    </Link>
  )
}

export default Logo