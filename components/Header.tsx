'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const menuItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/blogroll', label: 'Blogroll' },
    { href: '/all', label: 'All' },
  ]

  const handleNavClick = (href: string, label: string) => {
    if (isMenuOpen) setIsMenuOpen(false)
  }

  return (
    <header className="py-8">
      <div className="container mx-auto px-4 flex flex-col items-center">
        <Link 
          href="/" 
          className='mb-4'
        >
          <Image src="/profile.png" alt="oisin thomas" width={64} height={64} className='w-16 h-16 rounded-full'/>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center justify-center mb-8">
          <nav className="flex justify-center space-x-8 uppercase tracking-wide text-sm">
            {menuItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className='hover:underline'
                onClick={() => handleNavClick(item.href, item.label)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-8">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden flex flex-col items-center mt-4">
            <nav className="flex flex-col items-center space-y-4 uppercase tracking-wide text-sm">
              {menuItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => handleNavClick(item.href, item.label)}
                  className='hover:underline'
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex items-center">
                <ThemeToggle />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
