import Image from 'next/image';
import React from 'react';

const SubstackIcon = ({ className }) => (
  <Image
    src="/substack-icon.webp"
    alt="Substack Icon"
    width={24}
    height={24}
    className={className}
  />
);

export default SubstackIcon;
