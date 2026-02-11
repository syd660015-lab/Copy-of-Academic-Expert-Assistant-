import React from "react";

interface Props {
  children: React.ReactNode;
  activeView: any;
  setActiveView: any;
}

export const Layout: React.FC<Props> = ({ children }) => {
  return <div>{children}</div>;
};

