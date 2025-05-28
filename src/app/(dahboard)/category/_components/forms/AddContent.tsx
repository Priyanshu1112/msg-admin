"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React, { useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Loader from "@/app/_components/Loader";
import { parseDocxQuestions } from "@/app/(dahboard)/_parser/mcq";
import { parseMindMap } from "@/app/(dahboard)/_parser/mind-map";
import useContentStore from "@/store/content";

// Simplified schema - only for topic name
const addContentSchema = z.object({
  topicName: z.string().min(1, { message: "Topic name is required." }),
});

interface AddContentProps {
  topic: {
    id: string;
    name: string;
  };
  children: React.ReactNode;
}

type FormData = z.infer<typeof addContentSchema>;

interface FileValidationError {
  mindMapFiles?: string;
  questionFiles?: string;
}

const AddContent = ({ topic, children }: AddContentProps) => {
  const { createMindMaps, createQuestions } = useContentStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileErrors, setFileErrors] = useState<FileValidationError>({});

  // Refs for file inputs (uncontrolled)
  const mindMapFileRef = useRef<HTMLInputElement>(null);
  const questionFileRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(addContentSchema),
    defaultValues: {
      topicName: topic.name,
    },
  });

  // Validate file inputs manually
  const validateFiles = (): boolean => {
    const errors: FileValidationError = {};
    let isValid = true;

    // Get file data
    const mindMapFiles = mindMapFileRef.current?.files;
    const questionFiles = questionFileRef.current?.files;

    const hasMindMapFiles = mindMapFiles && mindMapFiles.length > 0;
    const hasQuestionFiles = questionFiles && questionFiles.length > 0;

    // Check if at least one type of file is selected
    if (!hasMindMapFiles && !hasQuestionFiles) {
      errors.mindMapFiles =
        "Please select at least one mind map file or question file.";
      errors.questionFiles =
        "Please select at least one mind map file or question file.";
      isValid = false;
    } else {
      // Validate mind map files if selected
      if (hasMindMapFiles) {
        const invalidFiles = Array.from(mindMapFiles).filter(
          (file) => !file.name.toLowerCase().endsWith(".xlsx")
        );
        if (invalidFiles.length > 0) {
          errors.mindMapFiles = "Only .xlsx files are allowed for mind maps.";
          isValid = false;
        }
      }

      // Validate question files if selected
      if (hasQuestionFiles) {
        const invalidFiles = Array.from(questionFiles).filter(
          (file) => !file.name.toLowerCase().endsWith(".docx")
        );
        if (invalidFiles.length > 0) {
          errors.questionFiles = "Only .docx files are allowed for questions.";
          isValid = false;
        }
      }
    }

    setFileErrors(errors);
    return isValid;
  };

  // Clear file errors when files are selected
  const handleMindMapFileChange = () => {
    if (fileErrors.mindMapFiles) {
      setFileErrors((prev) => ({ ...prev, mindMapFiles: undefined }));
    }
  };

  const handleQuestionFileChange = () => {
    if (fileErrors.questionFiles) {
      setFileErrors((prev) => ({ ...prev, questionFiles: undefined }));
    }
  };

  // Update the onSubmit function in AddContent.tsx
  const onSubmit = async (data: FormData) => {
    // Validate files before proceeding
    if (!validateFiles()) {
      return;
    }

    setIsLoading(true);

    try {
      // Get content store actions

      // Get file data
      const mindMapFiles = mindMapFileRef.current?.files;
      const questionFiles = questionFileRef.current?.files;

      // Temporary variables to store parsed results
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let parsedMindMapResults: any[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let parsedQuestionResults: any[] = [];

      // Parse mind map files if they exist
      if (mindMapFiles && mindMapFiles.length > 0) {
        console.log(`Processing ${mindMapFiles.length} mind map file(s)...`);

        try {
          parsedMindMapResults = await Promise.all(
            Array.from(mindMapFiles).map(async (file, index) => {
              console.log(`Parsing mind map file ${index + 1}: ${file.name}`);
              try {
                const result = await parseMindMap(file);
                console.log(
                  `✅ Successfully parsed mind map: ${file.name}`,
                  result
                );
                return result; // Return the parsed mind map data directly
              } catch (error) {
                console.error(`❌ Error parsing mind map ${file.name}:`, error);
                throw error; // Re-throw to handle in outer catch
              }
            })
          );
        } catch (error) {
          console.error("Error processing mind map files:", error);
          throw error;
        }
      }

      // Parse question files if they exist
      if (questionFiles && questionFiles.length > 0) {
        console.log(`Processing ${questionFiles.length} question file(s)...`);

        try {
          parsedQuestionResults = await Promise.all(
            Array.from(questionFiles).map(async (file, index) => {
              console.log(`Parsing question file ${index + 1}: ${file.name}`);
              try {
                const result = await parseDocxQuestions(file);
                console.log(
                  `✅ Successfully parsed questions: ${file.name}`,
                  result
                );
                return result; // Return the parsed questions array directly
              } catch (error) {
                console.error(
                  `❌ Error parsing questions ${file.name}:`,
                  error
                );
                throw error; // Re-throw to handle in outer catch
              }
            })
          );

          // Flatten the array if parseDocxQuestions returns arrays
          parsedQuestionResults = parsedQuestionResults.flat();
        } catch (error) {
          console.error("Error processing question files:", error);
          throw error;
        }
      }

      // Console log parsed results
      console.log("=== PARSING RESULTS ===");
      console.log("Topic ID:", topic.id);
      console.log("Topic Name:", data.topicName);
      console.log("Parsed Mind Maps:", parsedMindMapResults);
      console.log("Parsed Questions:", parsedQuestionResults);
      console.log("=== END RESULTS ===");

      // Create mind maps if any were parsed
      if (parsedMindMapResults.length > 0) {
        console.log(`Creating ${parsedMindMapResults.length} mind map(s)...`);
        await createMindMaps({
          topicId: topic.id,
          mindMaps: parsedMindMapResults,
        });
      }

      // Create questions if any were parsed
      if (parsedQuestionResults.length > 0) {
        console.log(`Creating ${parsedQuestionResults.length} question(s)...`);
        await createQuestions({
          topicId: topic.id,
          questions: parsedQuestionResults,
        });
      }

      // Reset everything on success
      setIsOpen(false);
      form.reset({
        topicName: topic.name,
      });

      // Reset file inputs
      if (mindMapFileRef.current) mindMapFileRef.current.value = "";
      if (questionFileRef.current) questionFileRef.current.value = "";
      setFileErrors({});

      console.log("✅ Content processed and uploaded successfully!");
    } catch (error) {
      console.error("❌ Error in onSubmit:", error);
      // Error handling is done by the content store via handleApiResponse
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    form.reset({
      topicName: topic.name,
    });

    // Reset file inputs
    if (mindMapFileRef.current) mindMapFileRef.current.value = "";
    if (questionFileRef.current) questionFileRef.current.value = "";
    setFileErrors({});
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent className="flex flex-col h-full">
        <SheetHeader className="sticky top-0 bg-white z-10">
          <SheetTitle>Add Content for Topic</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 p-6"
            >
              {/* Topic Name Field */}
              <FormField
                control={form.control}
                name="topicName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter topic name"
                        {...field}
                        className="bg-gray-50"
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mind Map Files Upload - Uncontrolled */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Mind Map Files (.xlsx)
                </label>
                <Input
                  ref={mindMapFileRef}
                  type="file"
                  accept=".xlsx"
                  multiple
                  onChange={handleMindMapFileChange}
                  className="file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 cursor-pointer hover:file:bg-blue-100"
                />
                <div className="text-sm text-muted-foreground">
                  Select one or more Excel files (.xlsx) for mind maps
                </div>
                {fileErrors.mindMapFiles && (
                  <p className="text-sm text-destructive">
                    {fileErrors.mindMapFiles}
                  </p>
                )}
              </div>

              {/* Question Files Upload - Uncontrolled */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Question Files (.docx)
                </label>
                <Input
                  ref={questionFileRef}
                  type="file"
                  accept=".docx"
                  multiple
                  onChange={handleQuestionFileChange}
                  className="file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 cursor-pointer file:text-green-700 hover:file:bg-green-100"
                />
                <div className="text-sm text-muted-foreground">
                  Select one or more Word documents (.docx) for questions
                </div>
                {fileErrors.questionFiles && (
                  <p className="text-sm text-destructive">
                    {fileErrors.questionFiles}
                  </p>
                )}
              </div>

              {/* File Upload Guidelines */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">
                  📁 File Upload Guidelines
                </h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    Mind Map files must be in Excel format (.xlsx)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    Question files must be in Word format (.docx)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    You can select multiple files for each category
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    Ensure files are properly formatted before upload
                  </li>
                </ul>
              </div>
            </form>
          </Form>
        </div>

        <SheetFooter className="sticky bottom-0 bg-white z-10 p-6 border-t">
          <div className="flex w-full gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader size={16} />
                  Uploading...
                </div>
              ) : (
                "Add Content"
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddContent;
