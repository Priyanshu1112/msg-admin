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
import QuestionTable from "../tables/QuestionTable";
import AddContentSheet, { ContentType } from "./AddContentSheet";
import FcTable from "../tables/FcTable";
import AddVideo from "./AddVideo";
import Videos from "../Videos";

interface AddContentProps {
  topic: {
    id: string;
    name: string;
  };
  children: React.ReactNode;
}

const AddContent = ({ topic, children }: AddContentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [addVideo, setAddVideo] = useState(false);
  const [tab, setTab] = useState("mindmap");
  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Clone FileList to prevent issues when resetting the input
    const fileArray = Array.from(files);
    const dataTransfer = new DataTransfer();
    fileArray.forEach((file) => dataTransfer.items.add(file));

    setSelectedFiles(dataTransfer.files);
    setSheetOpen(true);

    // Reset the input value to allow re-selection of the same file
    if (inputFileRef.current) {
      inputFileRef.current.value = "";
    }
  };

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
              <TabsTrigger className="cursor-pointer" value="mindmap">
                Mind Map
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="question">
                Questions
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="flashcard">
                Flash Cards
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="video">
                Video
              </TabsTrigger>
            </TabsList>
            <Button
              size={"sm"}
              variant={"outline"}
              className="cursor-pointer"
              onClick={() => {
                if (tab == "video") {
                  setAddVideo(true);
                } else if (inputFileRef.current) inputFileRef.current?.click();
              }}
            >
              Add {tab}
            </Button>
          </div>

          <AddVideo topicId={topic.id} open={addVideo} setOpen={setAddVideo} />

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

          <TabsContent value="question">
            <QuestionTable topicId={topic.id} />
          </TabsContent>

          <TabsContent value="flashcard">
            <FcTable topicId={topic.id} />
          </TabsContent>

          <TabsContent value="video">
            <Videos topicId={topic.id} />
          </TabsContent>
        </Tabs>

        <AddContentSheet
          open={sheetOpen}
          setOpen={setSheetOpen}
          selectedFiles={selectedFiles}
          topicId={topic.id}
          type={tab as ContentType}
        />
      </SheetContent>
    </Sheet>
  );
};

export default AddContent;

// function convertToEmbeddedLink(youtubeUrl) {
//   try {
//     const url = new URL(youtubeUrl);

//     // Handle youtu.be short links
//     if (url.hostname === "youtu.be") {
//       const videoId = url.pathname.slice(1); // Remove leading /
//       return `https://www.youtube.com/embed/${videoId}`;
//     }

//     // Handle full youtube.com URLs
//     if (url.hostname.includes("youtube.com") && url.searchParams.has("v")) {
//       const videoId = url.searchParams.get("v");
//       return `https://www.youtube.com/embed/${videoId}`;
//     }

//     return null;
//   } catch (e) {
//     console.error("Invalid URL", e);
//     return null;
//   }
// }

// // Example usage:
// const embeddedLink = convertToEmbeddedLink(
//  "https://youtu.be/hA2TJKJFsoE?si=GJCiw33HXdXAw9Jc"
// );

{
  /* <iframe
          // src="https://www.youtube.com/embed/2NjCWKlhxPY"
          src={embeddedLink}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-[350px] h-[200px]"
        ></iframe> */
}
