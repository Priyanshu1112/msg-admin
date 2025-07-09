import { TableCell, TableRow } from "@/components/ui/table";
import { LoaderCircle } from "lucide-react";
import React from "react";

const Loader = ({ size = 20 }: { size?: number }) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <LoaderCircle className="rotate" size={size} />
    </div>
  );
};

export const TableLoader = ({ colSpan }: { colSpan: number }) => {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-24 text-center">
        <Loader />
      </TableCell>
    </TableRow>
  );
};

export default Loader;
