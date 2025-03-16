'use client'

import React from 'react'

export default function Socials(){
  return (
    <div className="flex gap-4">
        <a
          href="https://x.com/caideiseach"
          className="inline-flex items-center justify-center p-2 rounded-full hover:bg-accent hover:text-accent-foreground"
        >
          <TwitterIcon className="w-5 h-5" />
        </a>
        <a
          href="https://www.linkedin.com/in/oisin-thomas-morrin/"
          className="inline-flex items-center justify-center p-2 rounded-full hover:bg-accent hover:text-accent-foreground"
        >
          <LinkedinIcon className="w-5 h-5" />
        </a>
        <a
          href="https://github.com/OisinThomasMorrin"
          className="inline-flex items-center justify-center p-2 rounded-full hover:bg-accent hover:text-accent-foreground"
        >
          <GithubIcon className="w-5 h-5" />
        </a>
      </div>
  )
}

function GithubIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    );
  }
  
  function LinkedinIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    );
  }
  
  function TwitterIcon(props: any) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fillRule="evenodd"
        clipRule="evenodd"
        imageRendering="optimizeQuality"
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
        viewBox="0 0 512 462.799"
        stroke="currentColor"
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path
          fillRule="nonzero"
          d="M403.229 0h78.506L310.219 196.04 512 462.799H354.002L230.261 301.007 88.669 462.799h-78.56l183.455-209.683L0 0h161.999l111.856 147.88L403.229 0zm-27.556 415.805h43.505L138.363 44.527h-46.68l283.99 371.278z"
        />
      </svg>
    );
  }
