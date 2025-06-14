  import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
  import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle,
    SheetFooter,
  } from "@/components/ui/sheet";
  import { parseDocxQuestions } from "@/app/(dahboard)/_parser/mcq";
  import useAppStore from "@/store/app";
  import { Button } from "@/components/ui/button";
  import useContentStore, { Question } from "@/store/content";
  import Loader from "@/app/_components/Loader";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Label } from "@/components/ui/label";
  import { Input } from "@/components/ui/input";

  interface AddQuestionProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    selectedFiles?: FileList | null;
    topicId?: string;
    isEdit?: boolean;
    bundleId?: string;
  }

  export interface ParsedOption {
    text: string;
    isCorrect: boolean;
  }
  export interface TaggedImg {
    tag: string;
    data: string;
  }

  export interface ParsedQuestion {
    text: string;
    options: ParsedOption[];
    explanation: string;
    images: TaggedImg[];
  }
  const AddQuestion = ({
    open,
    setOpen,
    selectedFiles,
    topicId,
    isEdit = false,
    bundleId = "",
  }: AddQuestionProps) => {
    const { setError } = useAppStore();
    const { creatingQuestions, createQuestionBundles, questionBundles } =
      useContentStore();

    const [parsedQuestions, setParsedQuestions] = useState<
      { name: string; questions: Question[] }[]
    >([]);

    const [isLoading, setIsLoading] = useState(false);

    // Parse files when component opens and files are available
    useEffect(() => {
      if (!isEdit) {
        const parseFiles = async () => {
          if (!selectedFiles || selectedFiles.length === 0) return;

          setIsLoading(true);
          try {
            const parsedQuestions = await Promise.all(
              Array.from(selectedFiles).map(async (file) => {
                const questions = await parseDocxQuestions(file);

                return { name: file.name.replace(".docx", ""), questions };
              })
            );

            setParsedQuestions(parsedQuestions.flat());
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
        const found = questionBundles.find((qb) => qb.id == bundleId);
        if (found) setParsedQuestions([found]);
      }
    }, [open, selectedFiles, setError, isEdit, questionBundles, bundleId]);

    // Handle form submission
    const handleSubmit = async () => {
      if (!topicId) return;

      await createQuestionBundles({
        topicId,
        bundles: parsedQuestions,
      });
      // Close the sheet after successful submission
      setOpen(false);

      // Reset state
      setParsedQuestions([]);
    };

    // Handle sheet close
    const handleClose = () => {
      setOpen(false);
      setParsedQuestions([]);
    };

    const updateBundleName = (index: number, newName: string) => {
      setParsedQuestions((prev) =>
        prev.map((item, i) => (i === index ? { ...item, name: newName } : item))
      );
    };

    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger></SheetTrigger>
        <SheetContent className="min-w-[50vw] h-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="sticky top-0 left-0 bg-white py-2">
              {isEdit ? "Edit" : "Add"} Questions
            </SheetTitle>

            <div className="overflow-y-auto p-4 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <Loader size={32} />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Parsing mind map files...
                    </p>
                  </div>
                </div>
              ) : parsedQuestions.length > 0 ? (
                <>
                  {!isEdit && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">
                        {parsedQuestions.length} file(s) parsed successfully.
                      </p>
                    </div>
                  )}

                  {parsedQuestions.map((p, index) => {
                    return (
                      <Card key={index} className="border">
                        <CardHeader className="flex flex-row items-start justify-between">
                          <CardTitle className="text-lg">
                            Bundle {index + 1}
                          </CardTitle>
                          {/* <PreviewMindMap
                            open={preview}
                            setOpen={setPreview}
                            mindMap={mindMap}
                          /> */}
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label htmlFor={`name-${index}`}>Name</Label>
                            <Input
                              id={`name-${index}`}
                              value={p.name}
                              onChange={(e) => {
                                updateBundleName(index, e.target.value);
                              }}
                              placeholder="Enter mind map name"
                              className="mt-1"
                            />
                          </div>

                          <div className="text-xs text-muted-foreground">
                            {isEdit
                              ? p._count.questions
                              : p.questions?.length ?? 0}{" "}
                            Questions
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {/* <Questions
                    topicId={topicId}
                    isUpload={true}
                    parsedQuestions={parsedQuestions}
                  /> */}
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

            <SheetFooter className="border-t p-4 sticky bottom-0 left-0 bg-white">
              <div className="flex justify-end space-x-2 w-full">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={creatingQuestions || isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    creatingQuestions || isLoading || parsedQuestions.length === 0
                  }
                >
                  {creatingQuestions ? (
                    <>
                      <Loader size={16} />
                      <span className="ml-2">Submitting...</span>
                    </>
                  ) : isEdit ? (
                    "Edit"
                  ) : (
                    `Submit`
                  )}
                </Button>
              </div>
            </SheetFooter>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  };

  export default AddQuestion;
