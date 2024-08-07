'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import profileImg from '@/public/profile.png'
import { Menu, X } from 'lucide-react'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const menuItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/blogroll', label: 'Blogroll' },
    { href: '/all', label: 'All' },
  ]

  return (
    <header className="py-8">
      <div className="container mx-auto px-4 flex flex-col items-center">
        <Link href="/" className='mb-4'>
          <Image src={profileImg} alt="oisin thomas" className='w-16 h-16 rounded-full'/>
        </Link>
        
        {/* Desktop Menu */}
        <nav className="hidden md:flex justify-center space-x-8 mb-8 uppercase tracking-wide text-sm ">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className='hover:underline'>{item.label}</Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <nav className="md:hidden flex flex-col items-center space-y-4 mt-4 uppercase tracking-wide text-sm">
            {menuItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className='hover:underline'
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header