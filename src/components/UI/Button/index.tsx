import React from 'react';

export enum ButtonType {
  primary = 'primary',
  secondary = 'secondary',
  tertiary = 'tertiary',
  quaternary = 'quaternary',
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: (ev: React.MouseEvent) => void;
  children?: React.ReactNode;
  cls?: string;
  fullWidth?: boolean;
  buttonType?: ButtonType;
}

const buttonTypeClassNames = {
  [ButtonType.primary]:
    'border-transparent bg-cyan-500 focus:ring-cyan-700 hover:bg-cyan-700 text-white',
  [ButtonType.secondary]:
    'border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
  [ButtonType.tertiary]:
    'border-transparent text-white bg-red-500 focus:ring-red-500 hover:bg-red-700',
  [ButtonType.quaternary]:
    'border-red-700 text-red-700 bg-white focus:ring-red-700',
};

const Button = ({
  onClick = () => {},
  buttonType = ButtonType.primary,
  cls = '',
  fullWidth = false,
  children,
  ...rest
}: ButtonProps) => {
  const getClassname = () => {
    const defaultClassnames = `items-center rounded-md border px-4 py-2 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 xs:max-w-full sm:max-w-full lg:max-w-md`;
    const widthCls = fullWidth ? 'w-full' : '';
    const disabledCls = rest.disabled
      ? 'bg-gray-200 hover:bg-gray-200 cursor-not-allowed opacity-50 focus:ring-gray-300 !text-gray-700'
      : '';
    return `${defaultClassnames} ${buttonTypeClassNames[buttonType]} ${widthCls} ${cls} ${disabledCls}`;
  };

  return (
    <button className={getClassname()} onClick={onClick} {...rest}>
      {children}
    </button>
  );
};

export default Button;
