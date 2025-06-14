import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loader from "@/app/_components/Loader";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { parseMindMap } from "@/app/(dahboard)/_parser/mind-map";
import useContentStore, { MindMap } from "@/store/content";
import useAppStore from "@/store/app";
import PreviewMindMap from "../PreviewMindMap";

// Simple Textarea component
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export interface ParsedMindMap {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mindMap: any;
  description: string;
}

interface AddMindMapProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  selectedFiles?: FileList | null;
  topicId?: string;
  isEdit?: boolean;
  mindMapId?: string;
}

const AddMindMap = ({
  open,
  setOpen,
  selectedFiles,
  topicId,
  isEdit = false,
  mindMapId = "",
}: AddMindMapProps) => {
  const { creatingMindMaps, createMindMaps, mindMaps, updateMindMap } =
    useContentStore();
  const { setError } = useAppStore();
  const [parsedMindMaps, setParsedMindMaps] = useState<ParsedMindMap[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState(false);

  // Parse files when component opens and files are available
  useEffect(() => {
    if (!isEdit) {
      const parseFiles = async () => {
        if (!selectedFiles || selectedFiles.length === 0) return;

        setIsLoading(true);
        try {
          const parsedMindMaps = await Promise.all(
            Array.from(selectedFiles).map(async (file) => {
              const mindMap = await parseMindMap(file);
              return {
                name: file.name.replace(".xlsx", ""), // Remove extension for cleaner name
                mindMap,
                description: "",
              };
            })
          );

          setParsedMindMaps(parsedMindMaps);
        } catch (error) {
          setError(
            error instanceof Error ? error.message : "Errow while parsing!"
          );
          // You could add error handling here, like showing a toast
        } finally {
          setIsLoading(false);
        }
      };

      if (open && selectedFiles) {
        parseFiles();
      }
    } else {
      const found = mindMaps.find((mm) => mm.id == mindMapId);
      if (found)
        setParsedMindMaps([
          { ...found, mindMap: JSON.parse(found.mindMap as unknown as string) },
        ]);
    }
  }, [open, selectedFiles, setError, isEdit, mindMapId, mindMaps]);

  // Update name for a specific mind map
  const updateMindMapName = (index: number, newName: string) => {
    setParsedMindMaps((prev) =>
      prev.map((item, i) => (i === index ? { ...item, name: newName } : item))
    );
  };

  // Update description for a specific mind map
  const updateMindMapDescription = (index: number, newDescription: string) => {
    setParsedMindMaps((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, description: newDescription } : item
      )
    );
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!isEdit && topicId)
      await createMindMaps({
        topicId,
        mindMaps: parsedMindMaps as unknown as MindMap[],
      });
    else
      await updateMindMap({
        mindMapId,
        // mindMap: parsedMindMaps[0] as MindMap,
        name: parsedMindMaps[0].name,
        description: parsedMindMaps[0].description,
      });
    // Close the sheet after successful submission
    setOpen(false);

    // Reset state
    setParsedMindMaps([]);
  };

  // Handle sheet close
  const handleClose = () => {
    setOpen(false);
    setParsedMindMaps([]);
  };

  function getFirstParents(
    mindMapJson: MindMap
  ): { id: string; name: string }[] {
    try {
      const root =
        typeof mindMapJson === "string" ? JSON.parse(mindMapJson) : mindMapJson;
      if (!root || !root.children) return [];

      return root.children.map(
        ({ id, name }: { id: string; name: string }) => ({ id, name })
      );
    } catch (err) {
      console.error("Invalid mindMap JSON:", err);
      return [];
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger></SheetTrigger>
      <SheetContent className="min-w-[50vw] flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit" : "Add"} Mind Maps</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <Loader size={32} />
                <p className="mt-2 text-sm text-muted-foreground">
                  Parsing mind map files...
                </p>
              </div>
            </div>
          ) : parsedMindMaps.length > 0 ? (
            <>
              <div className="mb-4">
                {!isEdit && (
                  <p className="text-sm text-muted-foreground">
                    {parsedMindMaps.length} mind map(s) parsed successfully.
                    Edit the names and descriptions below:
                  </p>
                )}
              </div>

              {parsedMindMaps.map((mindMap, index) => (
                <Card key={index} className="border">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <CardTitle className="text-lg">
                      Mind Map {index + 1}
                    </CardTitle>
                    <PreviewMindMap
                      open={preview}
                      setOpen={setPreview}
                      mindMap={mindMap}
                    />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor={`name-${index}`}>Name</Label>
                      <Input
                        id={`name-${index}`}
                        value={mindMap.name}
                        onChange={(e) =>
                          updateMindMapName(index, e.target.value)
                        }
                        placeholder="Enter mind map name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`description-${index}`}>
                        Description
                      </Label>
                      <Textarea
                        id={`description-${index}`}
                        value={mindMap.description}
                        onChange={(e) =>
                          updateMindMapDescription(index, e.target.value)
                        }
                        placeholder="Enter description (optional)"
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium capitalize">Root:</span>{" "}
                        {mindMap.mindMap?.name || "Unknown"}
                      </div>
                      <div>
                        <span className="font-medium">First children:</span>
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1 capitalize">
                          {getFirstParents(mindMap.mindMap).map((m) => (
                            <li key={m.id}>{m.name}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : selectedFiles && selectedFiles.length > 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No files to parse or parsing failed.
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No files selected.</p>
            </div>
          )}
        </div>

        <SheetFooter className="border-t p-4">
          <div className="flex justify-end space-x-2 w-full">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={creatingMindMaps || isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                creatingMindMaps ||
                isLoading ||
                parsedMindMaps.length === 0 ||
                parsedMindMaps.some((mm) => !mm.name.trim())
              }
            >
              {creatingMindMaps ? (
                <>
                  <Loader size={16} />
                  <span className="ml-2">Submitting...</span>
                </>
              ) : isEdit ? (
                "Edit"
              ) : (
                `Submit ${parsedMindMaps.length} Mind Map(s)`
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddMindMap;
