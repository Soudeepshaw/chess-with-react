import { ReactNode } from "react";
interface ButtonProps {
    onClick: () => void;
    children: ReactNode;
    className?: string;
  }
  export const Button: React.FC<ButtonProps> = ({ onClick, children, className }) => {
    return (
      <button onClick={onClick} className={`px-4 py-2 rounded ${className}`}>
        {children}
      </button>
    );
  };