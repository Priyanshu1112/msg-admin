import { TableCell, TableRow } from "@/components/ui/table";
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

export const NothingFoundTable = ({
  colSpan,
  text,
}: {
  colSpan: number;
  text: string;
}) => {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-24 text-center">
        <NothingFound text={text} />
      </TableCell>
    </TableRow>
  );
};

export default NothingFound;
