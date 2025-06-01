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
import Questions from "./Questions";
import AddQuestion from "./AddQuestion";

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
  const [questionOpen, setQuestionOpen] = useState(false);
  const [tab, setTab] = useState("mindmap");
  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  useEffect(() => {
    if (selectedFiles)
      if (tab == "mindmap") setMmOpen(true);
      else if (tab == "questions") setQuestionOpen(true);
  }, [selectedFiles, tab]);

  useEffect(() => {
    setSelectedFiles(null);
  }, [tab]);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(value) => {
        setIsOpen(value);
        setSelectedFiles(null);
      }}
    >
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="min-w-[40vw] flex h-full">
        <SheetHeader>
          <SheetTitle>{topic.name}</SheetTitle>
        </SheetHeader>

        <Tabs
          value={tab}
          onValueChange={setTab}
          className="p-4 pt-0 flex-1 overflow-y-auto"
        >
          <div className="flex justify-between items-center sticky top-0 left-0 bg-white">
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

          <TabsContent value="questions">
            <Questions topicId={topic.id} />
          </TabsContent>
        </Tabs>

        <AddMindMap
          open={mmOpen}
          setOpen={setMmOpen}
          selectedFiles={selectedFiles}
          topicId={topic.id}
        />

        <AddQuestion
          open={questionOpen}
          setOpen={setQuestionOpen}
          selectedFiles={selectedFiles}
          topicId={topic.id}
          
        />
      </SheetContent>
    </Sheet>
  );
};

export default AddContent;
