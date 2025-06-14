import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import useContentStore from "@/store/content";
import React, { Dispatch, SetStateAction, useMemo } from "react";
import Questions from "./forms/Questions";

const PreviewQuestions = ({
  open,
  setOpen,
  bundleId,
  trigger = true,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  bundleId: string;
  trigger?: boolean;
}) => {
  const { questionBundles } = useContentStore();

  const found = useMemo(() => {
    return questionBundles.find((qb) => qb.id == bundleId);
  }, [bundleId, questionBundles]);

  return (
    <Sheet open={open} onOpenChange={(value) => setOpen(value)}>
      <SheetTrigger>
        {trigger && (
          <Button variant="outline" size="sm">
            Preview
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="min-w-[40vw]">
        <SheetHeader>
          <SheetTitle>{found?.name}</SheetTitle>
        </SheetHeader>

        <div className="h-full overflow-y-auto">
          <Questions bundleId={bundleId} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PreviewQuestions;
