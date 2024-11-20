import React from 'react';

interface BadgeInterface {
  text?: string;
  textCls?: string;
  cls?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export default function Badge({
  text,
  icon,
  textCls,
  cls,
  onClick,
}: BadgeInterface) {
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center justify-center font-medium  transition-all rounded text-left leading-5 rounded-[10px] px-2.5 py-0.5 text-center leading-4 ${cls}`}
    >
      <div className={`transition-all flex items-start`}>{icon}</div>
      <div
        className={`transition-all flex h-full flex-1 items-center gap-2 self-stretch px-1 text-center`}
      >
        <p
          className={`transition-all text-xs leading-2 font-medium ${textCls}`}
        >
          {text}
        </p>
      </div>
    </div>
  );
}
