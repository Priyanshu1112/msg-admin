import React, { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ParsedMindMap } from "./forms/AddMindMap";
import MindMap from "../[id]/mind-map/_component/MindMap";

const PreviewMindMap = ({
  open,
  setOpen,
  mindMap,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  mindMap: ParsedMindMap;
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[90vw] min-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Preview: {mindMap.name}</DialogTitle>
        </DialogHeader>
        <MindMap initialData={mindMap.mindMap} />
      </DialogContent>
    </Dialog>
  );
};

export default PreviewMindMap;
