"use client";
import React, { useState } from "react";
import Logo from "@/components/Header/Logo";
const Header = () => {
  const [click, setClick] = useState(false);

  const toggle = () => {
    setClick(!click);
  };
  return (
    <header className="w-full p-4 px-5 sm:px-10 flex items-center justify-center gap-5 flex-wrap">
      <Logo />
    </header>
  );
};

export default Header;
