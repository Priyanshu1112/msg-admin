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
import useContentStore from "@/store/content";
import Loader from "@/app/_components/Loader";
import Questions from "./Questions";

interface AddQuestionProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  selectedFiles: FileList | null;
  topicId: string;
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
}: AddQuestionProps) => {
  const { setError } = useAppStore();
  const { creatingQuestions, createQuestions } = useContentStore();

  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  // Parse files when component opens and files are available
  useEffect(() => {
    const parseFiles = async () => {
      if (!selectedFiles || selectedFiles.length === 0) return;

      setIsLoading(true);
      try {
        const parsedQuestions = await Promise.all(
          Array.from(selectedFiles).map(async (file) => {
            return await parseDocxQuestions(file);  
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
  }, [open, selectedFiles, setError]);

  // Handle form submission
  const handleSubmit = async () => {
    await createQuestions({
      topicId,
      questions: parsedQuestions,
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger></SheetTrigger>
      <SheetContent className="min-w-[50vw] h-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="sticky top-0 left-0 bg-white py-2">
            Add Questions
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
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    {parsedQuestions.length} questions(s) parsed successfully.
                  </p>
                </div>

                <Questions
                  topicId={topicId}
                  isUpload={true}
                  parsedQuestions={parsedQuestions}
                />
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
