import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import React, { Dispatch, SetStateAction } from "react";

const AddMindMap = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger></SheetTrigger>
      <SheetContent>AddMindmap</SheetContent>
    </Sheet>
  );
};

export default AddMindMap;
