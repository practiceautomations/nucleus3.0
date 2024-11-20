import React from 'react';

import type { IconColors } from '@/utils/ColorFilters';

type ImageIconProps = {
  name: string;
  size?: number;
  style?: any;
  className?: string;
  // layout?: 'fixed' | 'fill' | 'intrinsic' | 'responsive' | undefined;
  color?: IconColors | string;
};
const ImageIcon = ({
  name,
  size = 16,
  style,
  className,
  // layout,
  color,
}: ImageIconProps) => {
  const path = `/assets/images/${name}.png`;
  const iconStyle = color ? { ...style, filter: color } : style;
  return (
    <img
      src={path}
      width={size}
      height={size}
      style={iconStyle}
      alt={name}
      className={className}
      // layout={layout}
    />
  );
};

export default ImageIcon;
