import React from "react";

const NothingFound = ({
  text,
  children,
}: {
  text: string;
  children?: React.ReactNode;
}) => {
  return (
    <p className="text-slate-600 font-medium text-center">
      {text} {children}
    </p>
  );
};

export default NothingFound;
