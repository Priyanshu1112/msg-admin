// CreateBundle.tsx
import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ToolTip from "@/app/_components/ToolTip";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Loader from "@/app/_components/Loader";
import { X, Plus, PlusIcon } from "lucide-react";
import { fetchPOST } from "@/store/_utils/fetchHelp";
import { FcBundle } from "@/store/content";

// Schema for bundle creation
const bundleSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  year: z.number().min(1).max(5, { message: "Year must be between 1 and 5." }),
  tags: z
    .array(z.string())
    .min(1, { message: "At least one tag is required." }),
  description: z.string().optional(),
});

// Year options
const yearOptions = [
  { value: 1, label: "1st Year" },
  { value: 2, label: "2nd Year" },
  { value: 3, label: "3rd Year" },
  { value: 4, label: "4th Year" },
  { value: 5, label: "5th Year" },
];

// Tag Input Component with search functionality
const TagInput = ({
  currentTags,
  onAddTag,
  onRemoveTag,
  allTags,
  isLoading,
  tagInput,
  onTagInputChange,
}: {
  currentTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (index: number) => void;
  allTags: string[];
  isLoading: boolean;
  tagInput: string;
  onTagInputChange: (value: string) => void;
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter suggestions based on input
  const filteredSuggestions = useMemo(() => {
    if (!tagInput.trim() || !Array.isArray(allTags)) return [];

    return allTags
      .filter(
        (tag) =>
          tag.toLowerCase().includes(tagInput.toLowerCase()) &&
          !currentTags.some(
            (existingTag) => existingTag.toLowerCase() === tag.toLowerCase()
          )
      )
      .slice(0, 10); // Limit to 10 suggestions
  }, [tagInput, allTags, currentTags]);

  const addTag = useCallback(
    (tag: string) => {
      const trimmedTag = tag.trim();
      const isAllowed = allTags.some(
        (allowedTag) => allowedTag.toLowerCase() === trimmedTag.toLowerCase()
      );
      if (
        trimmedTag &&
        isAllowed &&
        !currentTags.some((t) => t.toLowerCase() === trimmedTag.toLowerCase())
      ) {
        onAddTag(trimmedTag);
        onTagInputChange("");
        setShowSuggestions(false);
      }
    },
    [currentTags, allTags, onAddTag, onTagInputChange]
  );

  const handleInputChange = (value: string) => {
    onTagInputChange(value);
    setShowSuggestions(value.trim().length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Display current tags */}
      {currentTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {currentTags.map((tag: string, index: number) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center gap-2 border"
            >
              {tag}
              <button
                type="button"
                className="text-blue-600 hover:text-red-500 transition-colors"
                onClick={() => onRemoveTag(index)}
                title={`Remove ${tag}`}
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Tag input with suggestions */}
      <div className="relative">
        <div className="flex gap-2">
          <Input
            placeholder="Add tags (e.g., anatomy, important)..."
            value={tagInput}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(tagInput.trim().length > 0)}
            className="flex-1"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => addTag(tagInput)}
            disabled={!tagInput.trim() || isLoading}
          >
            {isLoading ? <Loader /> : <Plus size={16} />}
          </Button>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm transition-colors"
                onClick={() => addTag(suggestion)}
                onMouseDown={(e) => e.preventDefault()} // Prevent input blur
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500">
        Type to search and select tags from available suggestions. Only existing
        tags can be added.
      </p>
    </div>
  );
};

// Preview component to show matching flashcards count
const BundlePreview = ({
  year,
  tags,
  isLoading,
}: {
  year?: number;
  tags: string[];
  isLoading: boolean;
}) => {
  const [previewData, setPreviewData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchPreview = useCallback(async () => {
    if (!year || tags.length === 0) {
      setPreviewData(null);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/flashcard-bundle/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, tags }),
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewData(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch preview:", error);
    } finally {
      setLoading(false);
    }
  }, [year, tags]);

  // Auto-fetch preview when year or tags change
  React.useEffect(() => {
    const timer = setTimeout(fetchPreview, 500); // Debounce
    return () => clearTimeout(timer);
  }, [fetchPreview]);

  if (!year || tags.length === 0) return null;

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Bundle Preview</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-gray-600">Loading preview...</div>
        ) : previewData &&
          typeof previewData.matchingFlashCardCount === "number" ? (
          <div className="text-sm text-gray-700">
            {previewData.matchingFlashCardCount} flashcards found
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No flashcards found matching the selected criteria.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Bundle creation interface props
export interface BundleFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: boolean;
  isEdit?: boolean;
  bundle?: any;
  setBundles?: Dispatch<SetStateAction<FcBundle[]>>;
}

const CreateBundle = ({
  open = false,
  onOpenChange,
  trigger = true,
  isEdit = false,
  bundle = null,
  setBundles,
}: BundleFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [tagInput, setTagInput] = useState(""); // Add this state for TagInput

  const form = useForm<z.infer<typeof bundleSchema>>({
    resolver: zodResolver(bundleSchema),
    defaultValues: {
      name: bundle?.name ?? "",
      year: bundle?.year ?? undefined,
      tags: bundle?.tags ?? [],
      description: bundle?.description ?? "",
    },
  });

  // Watch form values for preview
  const watchedYear = form.watch("year");
  const watchedTags = form.watch("tags") || [];

  // Reset form when sheet opens for creation
  useEffect(() => {
    if (open && !isEdit) {
      form.reset({
        name: "",
        year: undefined,
        tags: [],
        description: "",
      });
    }
  }, [open, isEdit, form]);

  // Reset form when editing
  useEffect(() => {
    if (isEdit && bundle) {
      form.reset({
        name: bundle.name || "",
        year: bundle.year || undefined,
        tags: bundle.tags || [],
        description: bundle.description || "",
      });
    }
  }, [isEdit, bundle, form]);

  // Fetch tags from API with debouncing
  const fetchTags = useCallback(async (searchTerm: string) => {
    if (searchTerm.length < 2) return;

    setIsLoadingTags(true);
    try {
      const response = await fetch(
        `/api/flashcard/tags?search=${encodeURIComponent(searchTerm)}`
      );
      if (response.ok) {
        const data = await response.json();
        // Ensure we always set an array
        setAllTags(Array.isArray(data.data?.tags) ? data.data.tags : []);
      } else {
        console.error("Failed to fetch tags:", response.status);
        setAllTags([]);
      }
    } catch (error) {
      console.error("Failed to fetch tags:", error);
      setAllTags([]);
    } finally {
      setIsLoadingTags(false);
    }
  }, []);

  // Debounced tag fetching
  React.useEffect(() => {
    // Only fetch if we have some input in the tag field
    if (tagInput.length >= 2) {
      const timer = setTimeout(() => {
        fetchTags(tagInput);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      // Clear suggestions if input is too short
      setAllTags([]);
    }
  }, [tagInput, fetchTags]);

  // Handle tag input changes from TagInput component
  const handleTagInputChange = useCallback((value: string) => {
    setTagInput(value);
  }, []);

  // Add tag handler
  const handleAddTag = useCallback(
    (tag: string) => {
      const currentTags = form.getValues("tags") || [];
      if (!currentTags.includes(tag)) {
        form.setValue("tags", [...currentTags, tag]);
        form.clearErrors("tags");
      }
    },
    [form]
  );

  // Remove tag handler
  const handleRemoveTag = useCallback(
    (index: number) => {
      const currentTags = form.getValues("tags") || [];
      const newTags = currentTags.filter((_, i) => i !== index);
      form.setValue("tags", newTags);
    },
    [form]
  );

  // Submit handler
  const onSubmit = async (data: z.infer<typeof bundleSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        isEdit ? `/api/flashcard-bundle/${bundle.id}` : "/api/flashcard-bundle",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Request failed");

      if (isEdit) {
        alert(result.message);
        if (setBundles) {
          setBundles((prev) =>
            prev.map((b) =>
              b.id === bundle.id ? { ...b, ...result.data.bundle } : b
            )
          );
        }
      } else {
        alert(
          `Bundle created successfully! ${
            result.data.preview?.matchingFlashCardCount || 0
          } flashcards match your criteria.`
        );
        if (setBundles) {
          setBundles((prev) => [
            {
              ...result.data.bundle,
              flashCardCount: result.data.preview.matchingFlashCardCount,
            },
            ...prev,
          ]);
        }
      }

      form.reset();
      if (onOpenChange) onOpenChange(false);
    } catch (error) {
      alert(
        `Error: ${
          error instanceof Error ? error.message : "Failed to submit bundle"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <ToolTip content="Create FlashCard Bundle">
          <SheetTrigger asChild>
            {trigger && (
              <Button size="icon" variant="outline" className="cursor-pointer">
                <PlusIcon size={16} />
              </Button>
            )}
          </SheetTrigger>
        </ToolTip>
      )}

      <SheetContent className="flex flex-col h-full">
        <SheetHeader className="sticky top-0 bg-white z-10">
          <SheetTitle>Create FlashCard Bundle</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 p-6"
            >
              {/* Bundle Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bundle Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., First Year Anatomy Essentials"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Academic Year */}
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Year</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value?.toString()}
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select academic year" />
                        </SelectTrigger>
                        <SelectContent>
                          {yearOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value.toString()}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <TagInput
                        currentTags={field.value || []}
                        onAddTag={handleAddTag}
                        onRemoveTag={handleRemoveTag}
                        allTags={allTags}
                        isLoading={isLoadingTags}
                        tagInput={tagInput}
                        onTagInputChange={handleTagInputChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of this bundle..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Preview Section - Inside the form */}
              {watchedYear && watchedTags.length > 0 && (
                <div className="mt-6">
                  <BundlePreview
                    year={watchedYear}
                    tags={watchedTags}
                    isLoading={isSubmitting}
                  />
                </div>
              )}
            </form>
          </Form>
        </div>

        <SheetFooter className="sticky bottom-0 bg-white z-10 p-6 border-t">
          <div className="flex w-full gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setIsOpen(false);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader /> : isEdit ? "Edit" : "Create Bundle"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CreateBundle;
