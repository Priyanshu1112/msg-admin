/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useContentStore from "@/store/content";
import { Pencil, Trash2, Save, LoaderCircle, X } from "lucide-react";
import Image from "next/image";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const normalizeImages = (
  images: any
): { front: string | null; back: string | null } => {
  if (Array.isArray(images)) {
    return {
      front: images.find((img) => img.tag === "img-front")?.data || null,
      back: images.find((img) => img.tag === "img-back")?.data || null,
    };
  }
  return {
    front: images?.front || null,
    back: images?.back || null,
  };
};

const TagInput = ({
  editedCard,
  setEditedCard,
  allTags,
}: {
  editedCard: any;
  setEditedCard: Dispatch<SetStateAction<any>>;
  allTags: string[];
}) => {
  const [tagInput, setTagInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [showDebug, setShowDebug] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const filteredSuggestions = useMemo(() => {
    const query = tagInput.trim().toLowerCase();
    if (!query) return [];

    const filtered = allTags
      .filter((tag) => {
        const tagLower = tag.toLowerCase();
        const isAlreadyAdded = editedCard.tags.some(
          (existingTag: string) => existingTag.toLowerCase() === tagLower
        );
        const matchesQuery = tagLower.includes(query);

        return matchesQuery && !isAlreadyAdded;
      })
      .slice(0, 5); // Limit to 5 suggestions

    return filtered;
  }, [allTags, tagInput, editedCard.tags]);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();

    if (
      trimmedTag &&
      !editedCard.tags.some(
        (existingTag: string) =>
          existingTag.toLowerCase() === trimmedTag.toLowerCase()
      )
    ) {
      setEditedCard((prev: any) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
    } else {
    }
    setTagInput("");
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
  };

  const removeTag = (index: number) => {
    setEditedCard((prev: any) => ({
      ...prev,
      tags: prev.tags.filter((_: any, idx: number) => idx !== index),
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (
          selectedSuggestion >= 0 &&
          filteredSuggestions[selectedSuggestion]
        ) {
          addTag(filteredSuggestions[selectedSuggestion]);
        } else if (tagInput.trim()) {
          addTag(tagInput.trim());
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestion((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestion((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
        break;
    }
  };

  const handleInputChange = (value: string) => {
    setTagInput(value);
    const shouldShow = value.trim().length > 0;
    setShowSuggestions(shouldShow);
    setSelectedSuggestion(-1);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;

    return (
      <>
        {text.slice(0, index)}
        <mark className="bg-yellow-200 px-0.5">
          {text.slice(index, index + query.length)}
        </mark>
        {text.slice(index + query.length)}
      </>
    );
  };

  useEffect(() => {
    if (selectedSuggestion >= 0 && suggestionRefs.current[selectedSuggestion]) {
      suggestionRefs.current[selectedSuggestion]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedSuggestion]);

  return (
    <div className="space-y-2">
      {/* Existing Tags */}
      <div className="flex flex-wrap gap-2">
        {editedCard.tags.map((tag: string, i: number) => (
          <span
            key={i}
            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md flex items-center gap-1 border"
          >
            {tag}
            <button
              type="button"
              className="text-blue-600 hover:text-red-500 ml-1 transition-colors"
              onClick={() => removeTag(i)}
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>

      {/* Tag Input with Suggestions */}
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder="Add tag..."
          value={tagInput}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(tagInput.trim().length > 0)}
          className="text-sm"
        />

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  ref={(el) => (suggestionRefs.current[index] = el)}
                  type="button"
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 ${
                    selectedSuggestion === index
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700"
                  }`}
                  onClick={() => addTag(suggestion)}
                  onMouseEnter={() => setSelectedSuggestion(index)}
                >
                  {highlightMatch(suggestion, tagInput)}
                </button>
              ))
            ) : tagInput.trim().length > 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                No matching tags found. Press Enter to create "{tagInput.trim()}
                "
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500">
          Type to add tags. Press Enter to confirm, use ↑↓ to navigate
          suggestions.
        </p>
        <button
          type="button"
          onClick={() => setShowDebug(!showDebug)}
          className="text-xs text-blue-500 hover:text-blue-700"
        >
          {showDebug ? "Hide" : "Show"} Debug
        </button>
      </div>

      {/* Debug Panel */}
      {showDebug && (
        <div className="bg-gray-50 border rounded p-2 text-xs space-y-1">
          <div>
            <strong>Input:</strong> "{tagInput}"
          </div>
          <div>
            <strong>Show Suggestions:</strong> {showSuggestions.toString()}
          </div>
          <div>
            <strong>All Tags ({allTags.length}):</strong> {allTags.join(", ")}
          </div>
          <div>
            <strong>Current Tags:</strong> {editedCard.tags.join(", ")}
          </div>
          <div>
            <strong>Filtered Suggestions:</strong>{" "}
            {filteredSuggestions.join(", ")}
          </div>
        </div>
      )}
    </div>
  );
};

const PreviewFc = ({
  open,
  setOpen,
  bundleId,
  trigger = true,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  bundleId: string;
  trigger?: boolean;
}) => {
  const { fcBundles, fetchFlashCards, flashCards, updateFc, updatingFc } =
    useContentStore();
  const [editId, setEditId] = useState<string | null>(null);
  const [editedCard, setEditedCard] = useState<any | null>(null);

  useEffect(() => {
    fetchFlashCards(bundleId);
  }, [bundleId, fetchFlashCards]);

  const found = useMemo(
    () => fcBundles.find((qb) => qb.id === bundleId),
    [bundleId, fcBundles]
  );

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();

    flashCards.forEach((fc, index) => {
      fc.tags?.forEach((tag) => {
        if (tag && tag.trim()) {
          tagsSet.add(tag.trim());
        }
      });
    });

    const tagsArray = Array.from(tagsSet).sort();
    return tagsArray;
  }, [flashCards]);

  const startEdit = (fc: any) => {
    const { front, back } = normalizeImages(fc.images);
    setEditId(fc.id);
    setEditedCard({
      id: fc.id,
      question: fc.question,
      answer: fc.answer,
      tags: [...(fc.tags || [])],
      images: { front, back },
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditedCard(null);
  };

  const handleSave = async () => {
    if (!editedCard) return;
    await updateFc(editedCard);
    setEditId(null);
    setEditedCard(null);
  };

  const handleImageUpload = async (file: File, tag: "front" | "back") => {
    const base64 = await fileToBase64(file);
    setEditedCard((prev: any) => ({
      ...prev,
      images: { ...prev.images, [tag]: base64 },
    }));
  };

  const removeImage = (tag: "front" | "back") => {
    setEditedCard((prev: any) => ({
      ...prev,
      images: { ...prev.images, [tag]: null },
    }));
  };

  const replaceImage = (tag: "front" | "back") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleImageUpload(file, tag);
      }
    };
    input.click();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        {trigger && (
          <Button variant="outline" size="sm">
            Preview
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="min-w-[40vw] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg font-semibold">
            {found?.name}
          </SheetTitle>
        </SheetHeader>

        <div className="h-full overflow-y-auto flex flex-col px-4 gap-4 pb-4 mt-4">
          {flashCards.map((fc) => {
            const isEditing = editId === fc.id;
            const { front, back } = normalizeImages(fc.images);
            const card = isEditing
              ? editedCard
              : { ...fc, images: { front, back } };

            return (
              <Card key={fc.id} className="relative shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Question Section */}
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Question:
                        </label>
                        {isEditing ? (
                          <Textarea
                            className="w-full text-sm resize-none"
                            rows={3}
                            value={card.question}
                            placeholder="Enter your question..."
                            onChange={(e) =>
                              setEditedCard((prev: any) => ({
                                ...prev,
                                question: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          <CardTitle className="text-base leading-relaxed">
                            {card.question}
                          </CardTitle>
                        )}
                      </div>

                      {/* Question Image */}
                      {!isEditing && card.images.front && (
                        <div>
                          <Image
                            src={card.images.front}
                            alt="Question Image"
                            width={300}
                            height={150}
                            className="mt-2 border rounded-lg shadow-sm"
                          />
                        </div>
                      )}

                      {/* Tags Section */}
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-2">
                          Tags:
                        </label>
                        {isEditing ? (
                          <TagInput
                            editedCard={card}
                            setEditedCard={setEditedCard}
                            allTags={allTags}
                          />
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {card.tags?.length > 0 ? (
                              card.tags.map((tag: string) => (
                                <span
                                  key={tag}
                                  className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md border"
                                >
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-500 italic">
                                No tags
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col items-end gap-2">
                      {isEditing ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEdit}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </Button>
                          {updatingFc ? (
                            <LoaderCircle size={16} className="animate-spin" />
                          ) : (
                            <Button
                              size="sm"
                              onClick={handleSave}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                          )}
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(fc)}
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => console.log("Delete", fc.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Answer Section */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">
                      Answer:
                    </label>
                    {isEditing ? (
                      <Textarea
                        className="w-full text-sm resize-none"
                        rows={4}
                        value={card.answer}
                        placeholder="Enter your answer..."
                        onChange={(e) =>
                          setEditedCard((prev: any) => ({
                            ...prev,
                            answer: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {card.answer}
                      </p>
                    )}
                  </div>

                  {/* Answer Image */}
                  {!isEditing && card.images.back && (
                    <div>
                      <Image
                        src={card.images.back}
                        alt="Answer Image"
                        width={300}
                        height={150}
                        className="border rounded-lg shadow-sm"
                      />
                    </div>
                  )}

                  {/* Image Management in Edit Mode */}
                  {isEditing && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                      {/* Question Image */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-600 block">
                          Question Image:
                        </label>
                        {card.images.front ? (
                          <div className="relative">
                            <Image
                              src={card.images.front}
                              alt="Question Image"
                              width={200}
                              height={120}
                              className="border rounded-lg w-full h-24 object-cover"
                            />
                            <div className="flex gap-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => replaceImage("front")}
                                className="text-xs"
                              >
                                Replace
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 text-xs"
                                onClick={() => removeImage("front")}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                e.target.files?.[0] &&
                                handleImageUpload(e.target.files[0], "front")
                              }
                              className="hidden"
                              id={`front-image-${fc.id}`}
                            />
                            <label
                              htmlFor={`front-image-${fc.id}`}
                              className="cursor-pointer text-xs text-gray-500 hover:text-gray-700"
                            >
                              Click to add question image
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Answer Image */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-600 block">
                          Answer Image:
                        </label>
                        {card.images.back ? (
                          <div className="relative">
                            <Image
                              src={card.images.back}
                              alt="Answer Image"
                              width={200}
                              height={120}
                              className="border rounded-lg w-full h-24 object-cover"
                            />
                            <div className="flex gap-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => replaceImage("back")}
                                className="text-xs"
                              >
                                Replace
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 text-xs"
                                onClick={() => removeImage("back")}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                e.target.files?.[0] &&
                                handleImageUpload(e.target.files[0], "back")
                              }
                              className="hidden"
                              id={`back-image-${fc.id}`}
                            />
                            <label
                              htmlFor={`back-image-${fc.id}`}
                              className="cursor-pointer text-xs text-gray-500 hover:text-gray-700"
                            >
                              Click to add answer image
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {flashCards.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No flashcards found in this bundle.</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PreviewFc;
