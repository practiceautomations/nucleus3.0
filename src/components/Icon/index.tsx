import Image from 'next/image';
import React from 'react';

import type { IconColors } from '@/utils/ColorFilters';

type IconProps = {
  name: string;
  size?: number;
  style?: any;
  className?: string;
  layout?: 'fixed' | 'fill' | 'intrinsic' | 'responsive' | undefined;
  color?: IconColors;
};

const Icon = ({
  name,
  size = 16,
  style,
  className,
  layout,
  color,
}: IconProps) => {
  const path = `/assets/icons/${name}.svg`;
  const iconStyle = color ? { ...style, filter: color } : style;

  // const renderIcon = (type: string) => {
  //   switch (type) {
  //     case 'sort': {
  //       return (
  //         <svg
  //           width="20"
  //           height="20"
  //           viewBox="0 0 20 20"
  //           fill="none"
  //           xmlns="http://www.w3.org/2000/svg"
  //         >
  //           <path
  //             d="M2.5 3.3335H13.3333M2.5 6.66683H10M2.5 10.0002H7.5M10.8333 10.0002L14.1667 6.66683M14.1667 6.66683L17.5 10.0002M14.1667 6.66683V16.6668"
  //             stroke="#6B7280"
  //             strokeWidth="2"
  //             strokeLinecap="round"
  //             strokeLinejoin="round"
  //           />
  //         </svg>
  //       );
  //     }
  //     default:
  //       return <></>;
  //   }
  // };

  // const checkImageIsExists = (image_url: string) => {
  //   var http = new XMLHttpRequest();
  //   http.open('HEAD', image_url, false);
  //   http.send();
  //   return http.status != 404;
  // }

  // let url = '';
  // if (!checkImageIsExists(path)) {
  //   const svgStr = ReactDOMServer.renderToString(renderIcon(name));
  //   const svg = new Blob([svgStr], { type: 'image/svg+xml' });
  //   url = URL.createObjectURL(svg);
  // }

  return (
    <Image
      src={path}
      width={size}
      height={size}
      style={iconStyle}
      alt={name}
      className={className}
      layout={layout}
    />
  );
};

export default Icon;
