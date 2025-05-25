import ToolTip from "@/app/_components/ToolTip";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PlusIcon } from "lucide-react";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { category } from "./Category";

const subjectSchema = z.object({
  name: z.string().min(1, {
    message: "Name must be at least 1 characters.",
  }),
  country: z.string().min(1, { message: "Country must be selected." }),
  stream: z.string().min(1, { message: "Stream must be selected." }),
  course: z.string().min(1, { message: "Stream must be selected." }).optional(),
  year: z.array(z.number()).min(1, { message: "Year must be selected," }),
});

const chapterSchema = z.object({
  name: z.string().min(1, {
    message: "Name must be at least 1 characters.",
  }),
  subjectId: z.string().min(1, {
    message: "Id must be seleccted.",
  }),
});

const topicSchema = z.object({
  name: z.string().min(1, {
    message: "Name must be at least 1 characters.",
  }),
  chapterId: z.string().min(1, {
    message: "Id must be seleccted.",
  }),
});

const unifiedSchema = z.discriminatedUnion("type", [
  subjectSchema.extend({ type: z.literal("subject") }),
  chapterSchema.extend({ type: z.literal("chapter") }),
  topicSchema.extend({ type: z.literal("topic") }),
]);

const AddCategory = ({ activeTab }: { activeTab: category }) => {
  const form = useForm<z.infer<typeof unifiedSchema>>({
    resolver: zodResolver(unifiedSchema),
    defaultValues: {
      type: activeTab,
      name: "",
      // Add conditional defaults based on activeTab
      ...(activeTab === "subject" && {
        country: "",
        stream: "",
        course: "",
        year: [],
      }),
      ...(activeTab === "chapter" && {
        subjectId: "",
      }),
      ...(activeTab === "topic" && {
        chapterId: "",
      }),
    },
  });

  return (
    <Sheet>
      {/* Wrap the tooltip with a fragment and move Button outside */}
      <ToolTip content="Add Subject">
        <SheetTrigger asChild>
          <Button size={"icon"} variant={"outline"} className="cursor-pointer">
            <PlusIcon size={16} />
          </Button>
        </SheetTrigger>
      </ToolTip>

      <SheetContent className="flex flex-col h-full">
        <SheetHeader className="sticky top-0 bg-white z-10">
          <SheetTitle>SheetTitle</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto"></div>

        <SheetFooter className="sticky bottom-0 bg-white z-10">
          Footer
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddCategory;
