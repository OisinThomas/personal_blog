"use client";
import React, { useState } from "react";
import Logo from "@/components/Header/Logo";
import Link from "next/link";
import LinkedIn from "@/components/Header/LinkedIn";
import Github from "@/components/Header/Github";
import XLogo from "@/components/Header/XLogo";
const Header = () => {
  const [click, setClick] = useState(false);

  const toggle = () => {
    setClick(!click);
  };
  return (
    <header className="w-full p-4 px-5 sm:px-10 flex items-center justify-center gap-5 flex-wrap">
      <Logo />

      <nav
        className=" w-max py-3 px-8 relative border-t border-b border-solid border-dark font-medium capitalize  items-center bg-light/80 backdrop-blur-sm z-50"
      >
        <Link
          href="/"
          className="mr-4 hover:scale-125 transition-all ease duration-200 cursor-pointer pointer-events-auto z-51"
        >
          {" "}
          Home{" "}
        </Link>
        <Link
          href="/about"
          className="mr-4 hover:scale-125 transition-all ease duration-200 cursor-pointer pointer-events-auto z-51"
        >
          {" "}
          About{" "}
        </Link>
        <Link
          href="/categories/translation"
          className="mr-4 hover:scale-125 transition-all ease duration-200 cursor-pointer pointer-events-auto z-51"
        >
          {" "}
          Translations{" "}
        </Link>
        <Link
          href="/categories/tech"
          className="mr-4 hover:scale-125 transition-all ease duration-200 cursor-pointer pointer-events-auto z-51"
        >
          {" "}
          Tech{" "}
        </Link>
        <Link
          href="/categories/misc"
          className="mr-4 hover:scale-125 transition-all ease duration-200 cursor-pointer pointer-events-auto z-51"
        >
          {" "}
          Misc{" "}
        </Link>
      </nav>
    </header>
  );
};

export default Header;
