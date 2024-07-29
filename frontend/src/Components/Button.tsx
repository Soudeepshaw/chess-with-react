import { ReactNode } from "react";
interface ButtonProps {
    onClick?: () => void;
    children: ReactNode;
    className?: string;
    disabled?: boolean;
  }
  export const Button: React.FC<ButtonProps> = ({ onClick, children, className,disabled }) => {
    return (
      <button
      onClick={onClick}
      className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled}
    >
        {children}
      </button>
    );
  };