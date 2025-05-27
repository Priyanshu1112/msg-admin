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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PlusIcon, Trash2, Check, X, Plus } from "lucide-react";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import useCategoryStore from "@/store/category";
import Loader from "@/app/_components/Loader";
import { SearchableSelect } from "../FormSelects";

// Updated schema to handle multiple chapter names
const chapterSchema = z.object({
  subjectId: z.string().min(1, { message: "Subject must be selected." }),
  chapters: z
    .array(
      z.object({
        name: z
          .string()
          .min(3, { message: "Chapter name must be at least 3 characters." }),
      })
    )
    .min(1, { message: "At least one chapter is required." }),
});

export interface ChapterFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: boolean;
  edit?: boolean;
}

type FormData = z.infer<typeof chapterSchema>;

const AddChapterForm = ({
  open = false,
  onOpenChange,
  trigger = true,
  edit = false,
}: ChapterFormProps) => {
  const {
    subjects,
    creatingChapter,
    activeSubjectId,
    createChapters,
    chapters,
    updateChapter,
    activeChapterId,
    updatingChapter,
  } = useCategoryStore();
  const [isOpen, setIsOpen] = useState(open);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentInput, setCurrentInput] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const activeChapter = useMemo(() => {
    if (edit && activeChapterId)
      return chapters.find((ch) => ch.id == activeChapterId);
  }, [chapters, activeChapterId, edit]);

  const form = useForm<FormData>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      subjectId: activeSubjectId ?? "",
      chapters: [{ name: "" }],
    },
  });

  useEffect(() => {
    if (activeChapter)
      form.reset({
        subjectId: activeChapter.subject.id,
        chapters: [{ name: activeChapter.name }],
      });
  }, [activeChapter, form]);

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "chapters",
  });

  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  }, [isOpen, onOpenChange]);

  // Focus on the last input when a new field is added
  useEffect(() => {
    const lastIndex = fields.length - 1;
    if (inputRefs.current[lastIndex]) {
      inputRefs.current[lastIndex]?.focus();
    }
  }, [fields.length]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (edit) return;

    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      e.preventDefault();

      // Update current field value
      const currentValue = e.currentTarget.value.trim();
      update(index, { name: currentValue });

      // Add new empty field
      append({ name: "" });
    }
  };

  const handleSaveEdit = (index: number) => {
    if (currentInput.trim()) {
      update(index, { name: currentInput.trim() });
      setEditingIndex(null);
      setCurrentInput("");
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setCurrentInput("");
  };

  const handleDelete = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const addNewChapter = () => {
    append({ name: "" });
  };

  const onSubmit = async (data: FormData) => {
    // Filter out empty chapter names
    const validChapters = data.chapters.filter((chapter) =>
      chapter.name.trim()
    );

    if (validChapters.length === 0) {
      form.setError("chapters", {
        type: "required",
        message: "At least one chapter name is required.",
      });
      return;
    }

    if (edit && activeChapter) {
      const newName = validChapters[0].name.trim();
      const newSubjectId = data.subjectId;

      const nameChanged = newName !== activeChapter.name;
      const subjectChanged = newSubjectId !== activeChapter.subject.id;

      await updateChapter({
        id: activeChapter.id,
        ...(nameChanged ? { name: newName } : {}),
        ...(subjectChanged ? { subjectId: newSubjectId } : {}),
      });
    } else
      await createChapters({
        subjectId: data.subjectId,
        names: validChapters.map((chapter) => chapter.name.trim()),
      });

    setIsOpen(false);
    form.reset({
      subjectId: activeSubjectId ?? "",
      chapters: [{ name: "" }],
    });
  };

  const handleReset = () => {
    form.reset({
      subjectId: activeSubjectId ?? "",
      chapters: [{ name: "" }],
    });
    setEditingIndex(null);
    setCurrentInput("");
    setIsOpen(false);
  };

  const submitButtonText = useMemo(() => {
    if (edit) return "Edit";

    const validChapterCount = fields.length;
    const count = validChapterCount || 1;
    return `Create ${count} Chapter${count !== 1 ? "s" : ""}`;
  }, [fields, edit]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {trigger && (
        <ToolTip content="Add Chapter(s)">
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="cursor-pointer">
              <PlusIcon size={16} />
            </Button>
          </SheetTrigger>
        </ToolTip>
      )}

      <SheetContent className="flex flex-col h-full">
        <SheetHeader className="sticky top-0 bg-white z-10">
          <SheetTitle>{edit ? "Edit" : "Create"} Chapter(s)</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 p-6"
            >
              {/* Subject Field - Now on top */}
              <FormField
                control={form.control}
                name="subjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        options={subjects.map((subject) => ({
                          value: subject.id,
                          label: subject.name,
                        }))}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select subject"
                        searchPlaceholder="Search subjects..."
                        emptyMessage="No subject found."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Chapter Names Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Chapter Names</FormLabel>
                  {!edit && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addNewChapter}
                      className="flex items-center gap-2"
                    >
                      <Plus size={14} />
                      Add Chapter
                    </Button>
                  )}
                </div>

                {/* Dynamic Chapter Input Fields */}
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          {editingIndex === index ? (
                            <div className="flex items-center gap-2">
                              <Input
                                // ref={(el) => (inputRefs.current[index] = el)}
                                ref={(el) => {
                                  inputRefs.current[index] = el;
                                }}
                                value={currentInput}
                                onChange={(e) =>
                                  setCurrentInput(e.target.value)
                                }
                                placeholder={`Enter chapter ${index + 1} name`}
                                className="flex-1"
                                onKeyDown={(e) => {
                                  if (edit) return;

                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSaveEdit(index);
                                  } else if (e.key === "Escape") {
                                    handleCancelEdit();
                                  }
                                }}
                              />
                              {!edit && (
                                <>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleSaveEdit(index)}
                                    disabled={!currentInput.trim()}
                                  >
                                    <Check size={14} />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                  >
                                    <X size={14} />
                                  </Button>
                                </>
                              )}
                            </div>
                          ) : (
                            <FormField
                              control={form.control}
                              name={`chapters.${index}.name`}
                              render={({ field: inputField }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...inputField}
                                      ref={(el) => {
                                        inputRefs.current[index] = el;
                                      }}
                                      placeholder={`Enter chapter ${
                                        index + 1
                                      } name`}
                                      onKeyDown={(e) => handleKeyDown(e, index)}
                                      className="pr-20"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>

                        {!edit && editingIndex !== index && (
                          <div className="flex items-center gap-1">
                            {/* <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(index)}
                              className="p-2 h-8 w-8"
                            >
                              <Edit2 size={14} />
                            </Button> */}
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(index)}
                              disabled={fields.length === 1}
                              className="p-2 h-8 w-8 text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Chapter counter */}
                      <div className="text-xs text-muted-foreground pl-1">
                        Chapter {index + 1}
                        {field.name && ` - ${field.name}`}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Helper text */}
                {!edit && (
                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                    <p className="font-medium mb-1">Tips:</p>
                    <ul className="text-xs space-y-1">
                      <li>
                        • Press{" "}
                        <kbd className="px-1 py-0.5 bg-background rounded text-xs">
                          Enter
                        </kbd>{" "}
                        after typing to add a new chapter field
                      </li>
                      <li>
                        • Use edit button to modify existing chapter names
                      </li>
                      <li>• Delete unwanted chapters (minimum 1 required)</li>
                    </ul>
                  </div>
                )}

                {/* Display form errors for chapters array */}
                {form.formState.errors.chapters?.root && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.chapters.root.message}
                  </p>
                )}
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
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              className="flex-1"
              disabled={creatingChapter || updatingChapter}
            >
              {creatingChapter || updatingChapter ? (
                <Loader />
              ) : (
                //   (
                //     `Create ${
                //       fields.filter((f) => f.name.trim()).length || 1
                //     } Chapter${
                //       fields.filter((f) => f.name.trim()).length !== 1 ? "s" : ""
                //     }`
                //   )
                submitButtonText
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddChapterForm;
