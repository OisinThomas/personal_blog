import React from "react";
import Logo from "@/components/Header/Logo";
import Link from "next/link";
import LinkedIn from "@/components/Header/LinkedIn";
import Github from "@/components/Header/Github";
import XLogo from "@/components/Header/XLogo";
const Header = () => {
  return (
    <header className="w-full p-4 px-10 flex items-center justify-between">
      <Logo/>
      <nav className="flex items-center py-3 px-8 justify-between fixed top-6 right-1/2 translate-x-1/2 bg-light/80 backdrop-blur-sm z-50 pointer-events-none">
        <Link href="/" className="mr-4 hover:scale-125 transition-all ease duration-200 cursor-pointer pointer-events-auto"> Home </Link>
        <Link href="/about" className="mr-4 hover:scale-125 transition-all ease duration-200 cursor-pointer pointer-events-auto"> About </Link>
        <Link href="/categories/translation" className="mr-4 hover:scale-125 transition-all ease duration-200 cursor-pointer pointer-events-auto"> Translations </Link>
        <Link href="/categories/tech" className="mr-4 hover:scale-125 transition-all ease duration-200 cursor-pointer pointer-events-auto"> Tech </Link>
        <Link href="/categories/misc" className="mr-4 hover:scale-125 transition-all ease duration-200 cursor-pointer pointer-events-auto"> TIL & Misc </Link>
        </nav>
        <div className="flex ">
          <a href="https://www.linkedin.com/in/oisin-thomas-morrin" className="mr-3"><LinkedIn className="m-2 hover:scale-125 transition-all ease duration-200"/></a>
          <a href="https://twitter.com/oisin_thomas" className="mr-3"><XLogo className="m-2 hover:scale-125 transition-all ease duration-200"/></a>
          <a href="https://github.com/OisinThomasMorrin" className="mr-3"><Github className="m-2 hover:scale-125 transition-all ease duration-200"/></a>
        </div>
    </header>
  );
};

export default Header;
