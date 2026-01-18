import Image from 'next/image';
import React from 'react';

const SubstackIcon = ({ className }) => (
  <Image
    src="/substack-icon.webp"
    alt="Substack Icon"
    width={24}
    height={24}
    className={`transition-opacity hover:opacity-70 ${className || ''}`}
  />
);

export default SubstackIcon;
