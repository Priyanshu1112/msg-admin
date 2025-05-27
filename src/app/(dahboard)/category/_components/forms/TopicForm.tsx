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

// Updated schema to handle multiple topic names
const topicSchema = z.object({
  chapterId: z.string().min(1, { message: "Chapter must be selected." }),
  topics: z
    .array(
      z.object({
        name: z
          .string()
          .min(3, { message: "Topic name must be at least 3 characters." }),
      })
    )
    .min(1, { message: "At least one topic is required." }),
});

interface TopicFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: boolean;
  edit?: boolean;
}

type FormData = z.infer<typeof topicSchema>;

const AddTopicForm = ({
  open = false,
  onOpenChange,
  trigger = true,
  edit = false,
}: TopicFormProps) => {
  const {
    chapters,
    creatingTopic,
    createTopics,
    activeChapterId,
    activeTopicId,
    topics,
    updateTopic,
    updatingTopic,
  } = useCategoryStore();
  const [isOpen, setIsOpen] = useState(open);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentInput, setCurrentInput] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const activeTopic = useMemo(() => {
    if (edit && activeTopicId)
      return topics.find((top) => top.id == activeTopicId);
  }, [topics, activeTopicId, edit]);

  const form = useForm<FormData>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      chapterId: activeChapterId ?? "",
      topics: [{ name: "" }],
    },
  });

  useEffect(() => {
    if (activeTopic)
      form.reset({
        chapterId: activeTopic.chapter.id,
        topics: [{ name: activeTopic.name }],
      });
  }, [activeTopic, form]);

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "topics",
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
    if (edit) return; // Skip if in edit mode

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

  const addNewTopic = () => {
    append({ name: "" });
  };

  const onSubmit = async (data: FormData) => {
    // Filter out empty topic names
    const validTopics = data.topics.filter((topic) => topic.name.trim());

    if (validTopics.length === 0) {
      form.setError("topics", {
        type: "required",
        message: "At least one topic name is required.",
      });
      return;
    }

    if (edit && activeTopic) {
      const newName = validTopics[0].name.trim();
      const newChapterId = data.chapterId;

      const nameChanged = newName !== activeTopic.name;
      const chapterChanged = newChapterId !== activeTopic.chapter.id;

      await updateTopic({
        id: activeTopic.id,
        ...(nameChanged ? { name: newName } : {}),
        ...(chapterChanged ? { chapterId: newChapterId } : {}),
      });
    }
    // Here you would call your API to create multiple topics
    else
      await createTopics({
        chapterId: data.chapterId,
        names: validTopics.map((topic) => topic.name.trim()),
      });

    setIsOpen(false);
    form.reset({
      chapterId: activeChapterId ?? "",
      topics: [{ name: "" }],
    });
  };

  const handleReset = () => {
    form.reset({
      chapterId: activeChapterId ?? "",
      topics: [{ name: "" }],
    });
    setEditingIndex(null);
    setCurrentInput("");
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {trigger && (
        <ToolTip content="Add Topic(s)">
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="cursor-pointer">
              <PlusIcon size={16} />
            </Button>
          </SheetTrigger>
        </ToolTip>
      )}

      <SheetContent className="flex flex-col h-full">
        <SheetHeader className="sticky top-0 bg-white z-10">
          <SheetTitle>{edit ? "Edit" : "Create"} Topic(s)</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 p-6"
            >
              {/* Chapter Field - Now on top */}
              <FormField
                control={form.control}
                name="chapterId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chapter</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        options={chapters.map((chapter) => ({
                          value: chapter.id,
                          label: chapter.name,
                        }))}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select chapter"
                        searchPlaceholder="Search chapters..."
                        emptyMessage="No chapter found."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Topic Names Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Topic Names</FormLabel>
                  {!edit && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addNewTopic}
                      className="flex items-center gap-2"
                    >
                      <Plus size={14} />
                      Add Topic
                    </Button>
                  )}
                </div>

                {/* Dynamic Topic Input Fields */}
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          {editingIndex === index ? (
                            <div className="flex items-center gap-2">
                              <Input
                                ref={(el) => {
                                  inputRefs.current[index] = el;
                                }}
                                value={currentInput}
                                onChange={(e) =>
                                  setCurrentInput(e.target.value)
                                }
                                placeholder={`Enter topic ${index + 1} name`}
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
                              name={`topics.${index}.name`}
                              render={({ field: inputField }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...inputField}
                                      ref={(el) => {
                                        inputRefs.current[index] = el;
                                      }}
                                      placeholder={`Enter topic ${
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

                      {/* Topic counter */}
                      <div className="text-xs text-muted-foreground pl-1">
                        Topic {index + 1}
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
                        after typing to add a new topic field
                      </li>
                      <li>• Use edit button to modify existing topic names</li>
                      <li>• Delete unwanted topics (minimum 1 required)</li>
                    </ul>
                  </div>
                )}

                {/* Display form errors for topics array */}
                {form.formState.errors.topics?.root && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.topics.root.message}
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
              disabled={creatingTopic || updatingTopic}
            >
              {creatingTopic || updatingTopic ? (
                <Loader />
              ) : edit ? (
                "Edit"
              ) : (
                `Create ${fields.length || 1} Topic${
                  fields.length !== 1 ? "s" : ""
                }`
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddTopicForm;
