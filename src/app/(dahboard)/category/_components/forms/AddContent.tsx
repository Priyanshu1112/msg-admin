"use client";

import { useEffect, useRef, useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import MindMapTable from "../tables/MindMapTable";
import { Input } from "@/components/ui/input";
import AddMindMap from "./AddMindMap";

interface AddContentProps {
  topic: {
    id: string;
    name: string;
  };
  children: React.ReactNode;
}

const AddContent = ({ topic, children }: AddContentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mmOpen, setMmOpen] = useState(false);
  const [tab, setTab] = useState("mindmap");
  const inputFileRef = useRef<HTMLInputElement | null>(null);
  // inside the component

  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);

    // if (tab === "mindmap") {
    //   if (!selectedFiles || selectedFiles.length === 0) return;

    //   try {
    //     const parsedMindMaps = await Promise.all(
    //       Array.from(selectedFiles).map(async (file) => {
    //         const data = await parseMindMap(file);
    //         return {
    //           name: file.name,
    //           data,
    //         };
    //       })
    //     );

    //     console.log("Parsed Mind Maps:", parsedMindMaps);
    //     // You can now use createMindMaps({ topicId: topic.id, mindMaps: parsedMindMaps })
    //   } catch (error) {
    //     console.error("Error parsing mind maps:", error);
    //   }
    // } else if (tab === "questions") {
    //   // handle question file submission
    // }
  };

  useEffect(() => {
    if (selectedFiles) setMmOpen(true);
  }, [selectedFiles]);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(value) => {
        setIsOpen(value);
        setSelectedFiles(null);
      }}
    >
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="min-w-[40vw] flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>{topic.name}</SheetTitle>
        </SheetHeader>

        <Tabs
          value={tab}
          onValueChange={setTab}
          className="p-4 flex-1 overflow-y-auto"
        >
          <div className="flex justify-between items-center">
            <TabsList className="mb-4">
              <TabsTrigger value="mindmap">Mind Map</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
            </TabsList>
            <Button
              size={"sm"}
              variant={"outline"}
              className="cursor-pointer"
              onClick={() => {
                if (inputFileRef.current) inputFileRef.current?.click();
              }}
            >
              Add {tab}
            </Button>
          </div>

          <Input
            ref={inputFileRef}
            type="file"
            accept={tab == "mindmap" ? ".xlsx" : ".docx"}
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          <TabsContent value="mindmap">
            <MindMapTable topicId={topic.id} />
          </TabsContent>

          <TabsContent value="questions"></TabsContent>
        </Tabs>

        <AddMindMap open={mmOpen} setOpen={setMmOpen} />
      </SheetContent>
    </Sheet>
  );
};

export default AddContent;
