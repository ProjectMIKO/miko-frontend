import React, { ReactNode } from "react";

interface HeaderProps {
  children?: ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => (
  <header className="bg-[#96a0fe] p-4 text-center text-lg font-bold text-white w-full h-16 z-50 absolute">
    {children}
  </header>
);

export default Header;
