import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import useContentStore, { Question, TaggedImg } from "@/store/content";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  useReducer,
  Dispatch,
  SetStateAction,
} from "react";
import TextWithImages from "./TextWithImage";
import Loader from "@/app/_components/Loader";
import {
  LoaderCircle,
  Trash2Icon,
  PencilIcon,
  ImagePlus,
  X,
  Save,
  CheckCircle,
  Circle,
  Copy,
} from "lucide-react";

// Define action types for the reducer
type EditAction =
  | { type: "SET_QUESTION"; payload: any }
  | { type: "UPDATE_TEXT"; payload: string }
  | { type: "UPDATE_EXPLANATION"; payload: string }
  | { type: "UPDATE_OPTION_TEXT"; payload: { index: number; text: string } }
  | { type: "TOGGLE_OPTION_CORRECT"; payload: { index: number } }
  | { type: "ADD_OPTION" }
  | { type: "DELETE_OPTION"; payload: { index: number } }
  | { type: "ADD_TAG"; payload: string }
  | { type: "REMOVE_TAG"; payload: { index: number } }
  | { type: "ADD_IMAGE"; payload: { data: string } }
  | { type: "DELETE_IMAGE"; payload: { tag: string } }
  | { type: "CLEAR" };

// Helper function to renumber images sequentially
function renumberImages(images: any[]) {
  return images.map((img, index) => ({
    ...img,
    tag: `img-${index + 1}`,
  }));
}

// Reducer for managing edited question state
function editedQuestionReducer(state: any, action: EditAction) {
  switch (action.type) {
    case "SET_QUESTION":
      const newState = {
        ...action.payload,
        tags: [...(action.payload.tags || [])],
        options: action.payload.options
          ? action.payload.options.map((opt: any) => ({ ...opt }))
          : [],
        images: action.payload.images
          ? renumberImages([...action.payload.images])
          : [],
      };
      return newState;

    case "UPDATE_TEXT":
      return { ...state, text: action.payload };

    case "UPDATE_EXPLANATION":
      return { ...state, explanation: action.payload };

    case "UPDATE_OPTION_TEXT":
      const newOptions = [...(state.options || [])];
      if (newOptions[action.payload.index]) {
        newOptions[action.payload.index] = {
          ...newOptions[action.payload.index],
          text: action.payload.text,
        };
      }
      return { ...state, options: newOptions };

    case "TOGGLE_OPTION_CORRECT":
      const toggleOptions = [...(state.options || [])];
      const targetOption = toggleOptions[action.payload.index];

      if (targetOption) {
        // If setting to correct, uncheck all others first
        if (!targetOption.isCorrect) {
          toggleOptions.forEach((option, index) => {
            toggleOptions[index] = { ...option, isCorrect: false };
          });
        }
        // Toggle the target option
        toggleOptions[action.payload.index] = {
          ...targetOption,
          isCorrect: !targetOption.isCorrect,
        };
      }
      return { ...state, options: toggleOptions };

    case "ADD_OPTION":
      const addOptions = [...(state.options || [])];
      addOptions.push({
        id: crypto.randomUUID(),
        text: "",
        isCorrect: false,
      });
      return { ...state, options: addOptions };

    case "DELETE_OPTION":
      if (
        !state?.options ||
        action.payload.index < 0 ||
        action.payload.index >= state.options.length
      ) {
        return state;
      }

      const deleteOptions = [...(state.options || [])];
      deleteOptions.splice(action.payload.index, 1);
      return { ...state, options: deleteOptions };

    case "ADD_TAG":
      const newTags = [...(state.tags || [])];
      if (
        !newTags.some(
          (tag) => tag.toLowerCase() === action.payload.toLowerCase()
        )
      ) {
        newTags.push(action.payload);
      }
      return { ...state, tags: newTags };

    case "REMOVE_TAG":
      const removeTags = [...(state.tags || [])];
      removeTags.splice(action.payload.index, 1);
      return { ...state, tags: removeTags };

    case "ADD_IMAGE":
      const currentImages = [...(state.images || [])];
      const nextImageNumber = currentImages.length + 1;
      const newImageTag = `img-${nextImageNumber}`;

      currentImages.push({ tag: newImageTag, data: action.payload.data });
      return { ...state, images: currentImages };

    case "DELETE_IMAGE":
      const filteredImages = (state.images || []).filter(
        (img: any) => img.tag !== action.payload.tag
      );
      // Renumber remaining images to maintain sequential order
      const renumberedImages = renumberImages(filteredImages);
      return { ...state, images: renumberedImages };

    case "CLEAR":
      return null;

    default:
      return state;
  }
}

// Simple Tag Input Component
const TagInput = ({
  currentQuestion,
  dispatch,
  allTags,
}: {
  currentQuestion: any;
  dispatch: Dispatch<EditAction>;
  allTags: string[];
}) => {
  const [tagInput, setTagInput] = useState("");

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag) {
      dispatch({ type: "ADD_TAG", payload: trimmedTag });
    }
    setTagInput("");
  };

  const removeTag = (index: number) => {
    dispatch({ type: "REMOVE_TAG", payload: { index } });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {(currentQuestion.tags || []).map((tag: string, i: number) => (
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

      <div className="flex gap-2">
        <Input
          placeholder="Add tag..."
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag(tagInput);
            }
          }}
          className="text-sm flex-1"
        />
        <Button
          size="sm"
          onClick={() => addTag(tagInput)}
          disabled={!tagInput.trim()}
        >
          Add
        </Button>
      </div>
    </div>
  );
};

const Questions = ({
  bundleId,
  isUpload = false,
  parsedQuestions = [],
}: {
  bundleId: string;
  isUpload?: boolean;
  parsedQuestions?: Question[];
}) => {
  const {
    questions: storeQuestions,
    fetchQuestions,
    loadingQuestions,
    deleteQuestion,
    updateQuestion: updateSQ,
    updatingQuestions,
  } = useContentStore();

  const [deleteId, setDeleteId] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Use reducer for edited question state
  const [editedQuestion, dispatch] = useReducer(editedQuestionReducer, null);

  // Initialize questions
  const initializeQuestions = useCallback(
    (questions: Question[]): Question[] =>
      questions.map((q) => ({
        ...q,
        images: q.images === null ? [] : q.images ?? [],
        options: q.options ?? [],
        tags: q.tags ?? [],
      })),
    []
  );

  const [questions, setQuestions] = useState<Question[]>(() =>
    initializeQuestions(parsedQuestions)
  );

  // All tags for autocomplete
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    questions.forEach((question) => {
      question.tags?.forEach((tag) => {
        if (tag && tag.trim()) {
          tagsSet.add(tag.trim());
        }
      });
    });
    return Array.from(tagsSet).sort();
  }, [questions]);

  // Sync with store questions
  useEffect(() => {
    if (!isUpload && storeQuestions.length > 0) {
      const initializedQuestions = initializeQuestions(storeQuestions);
      setQuestions(initializedQuestions);
    }
  }, [storeQuestions, isUpload, initializeQuestions]);

  useEffect(() => {
    fetchQuestions(bundleId);
  }, [fetchQuestions, bundleId]);

  // Edit toggle - Proper state initialization
  const handleEditToggle = useCallback(
    (index: number) => {
      if (editIndex === index) {
        setEditIndex(null);
        dispatch({ type: "CLEAR" });
      } else {
        const question = questions[index];
        setEditIndex(index);
        // Ensure we dispatch with proper data structure
        dispatch({
          type: "SET_QUESTION",
          payload: {
            ...question,
            options: question.options || [],
            images: question.images || [],
            tags: question.tags || [],
          },
        });
      }
    },
    [editIndex, questions]
  );

  // Question text change
  const handleQuestionTextChange = useCallback((value: string) => {
    dispatch({ type: "UPDATE_TEXT", payload: value });
  }, []);

  // Explanation change
  const handleExplanationChange = useCallback((value: string) => {
    dispatch({ type: "UPDATE_EXPLANATION", payload: value });
  }, []);

  // Option text change
  const handleOptionChange = useCallback((optIndex: number, value: string) => {
    dispatch({
      type: "UPDATE_OPTION_TEXT",
      payload: { index: optIndex, text: value },
    });
  }, []);

  // Toggle correct option
  const handleToggleCorrectOption = useCallback((optIndex: number) => {
    dispatch({ type: "TOGGLE_OPTION_CORRECT", payload: { index: optIndex } });
  }, []);

  // Add option
  const handleAddOption = useCallback(() => {
    dispatch({ type: "ADD_OPTION" });
  }, []);

  // Delete option
  const handleDeleteOption = useCallback(
    (optIndex: number) => {
      if (editedQuestion?.options && editedQuestion.options.length <= 1) {
        alert("At least one option is required");
        return;
      }

      if (
        !editedQuestion?.options ||
        optIndex < 0 ||
        optIndex >= editedQuestion.options.length
      ) {
        return;
      }

      dispatch({ type: "DELETE_OPTION", payload: { index: optIndex } });
    },
    [editedQuestion]
  );

  // Image change - Updated to not use tag in payload
  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert("Please select an image smaller than 10MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const data = reader.result as string;
        if (data) {
          // Tag will be generated automatically in the reducer
          dispatch({ type: "ADD_IMAGE", payload: { data } });
        }
      };
      reader.readAsDataURL(file);
    },
    []
  );

  // Delete image
  const handleDeleteImage = useCallback((tag: string) => {
    dispatch({ type: "DELETE_IMAGE", payload: { tag } });
  }, []);

  // Copy image tag to clipboard
  const handleCopyImageTag = useCallback(async (tag: string) => {
    const formattedTag = `$${tag}$`;
    try {
      await navigator.clipboard.writeText(formattedTag);
      // You could add a toast notification here if you have a toast system
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = formattedTag;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  }, []);

  // Save function
  const handleSave = useCallback(async () => {
    if (!editedQuestion) {
      alert("No changes to save");
      return;
    }

    // Validation
    if (!editedQuestion.text?.trim()) {
      alert("Question text is required");
      return;
    }

    if (!editedQuestion.options || editedQuestion.options.length === 0) {
      alert("At least one option is required");
      return;
    }

    const hasValidOption = editedQuestion.options.some((opt: any) =>
      opt.text?.trim()
    );
    if (!hasValidOption) {
      alert("At least one option must have text");
      return;
    }

    const correctOptions = editedQuestion.options.filter(
      (opt: any) => opt.isCorrect
    );
    if (correctOptions.length === 0) {
      alert("Please select the correct answer");
      return;
    }

    try {
      await updateSQ(editedQuestion);

      // Update local state
      if (editIndex !== null) {
        setQuestions((prev) =>
          prev.map((q, i) => (i === editIndex ? editedQuestion : q))
        );
      }

      setEditIndex(null);
      dispatch({ type: "CLEAR" });
    } catch (error) {
      alert(`Failed to save: ${error}`);
    }
  }, [editedQuestion, editIndex, updateSQ]);

  // Trigger add image
  const triggerAddImage = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const event = e as unknown as React.ChangeEvent<HTMLInputElement>;
      handleImageChange(event);
    };
    input.click();
  }, [handleImageChange]);

  if (loadingQuestions) {
    return (
      <div className="px-4 pb-4">
        <Loader />
      </div>
    );
  }

  return (
    <div className="px-4 pb-4">
      {questions.map((q, qIndex) => {
        // Use editedQuestion when in edit mode
        const currentQuestion =
          editIndex === qIndex && editedQuestion ? editedQuestion : q;
        const isEditing = editIndex === qIndex;

        return (
          <Card key={q.id || `question-${qIndex}`} className="mb-4">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex gap-1 items-start w-full">
                  <p className="font-semibold">Q{qIndex + 1}:</p>
                  {isEditing ? (
                    <Textarea
                      className="ml-2"
                      value={currentQuestion.text || ""}
                      onChange={(e) => handleQuestionTextChange(e.target.value)}
                      placeholder="Enter question text..."
                    />
                  ) : (
                    <div className="ml-2">
                      <TextWithImages
                        text={currentQuestion.text}
                        images={currentQuestion.images || []}
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {isEditing ? (
                    updatingQuestions ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : (
                      <Save
                        onClick={handleSave}
                        size={16}
                        className="cursor-pointer text-green-600 hover:text-green-800"
                      />
                    )
                  ) : (
                    <PencilIcon
                      onClick={() => handleEditToggle(qIndex)}
                      size={16}
                      className="cursor-pointer text-blue-600 hover:text-blue-800"
                    />
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-2">
              {/* Options */}
              <div className="space-y-2">
                {(currentQuestion.options || []).map(
                  (o: any, optIndex: number) => {
                    const label = String.fromCharCode(65 + optIndex);
                    return (
                      <div
                        key={`${q.id || qIndex}-option-${optIndex}`}
                        className="pl-4 flex items-center gap-2"
                      >
                        <p
                          className={cn(
                            o.isCorrect && "text-green-600 font-semibold"
                          )}
                        >
                          {label})
                        </p>
                        {isEditing ? (
                          <>
                            <Input
                              value={o.text || ""}
                              onChange={(e) =>
                                handleOptionChange(optIndex, e.target.value)
                              }
                              className="flex-1"
                              placeholder={`Option ${label}`}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleToggleCorrectOption(optIndex)
                              }
                              className={cn(
                                "p-1",
                                o.isCorrect ? "text-green-600" : "text-gray-400"
                              )}
                            >
                              {o.isCorrect ? (
                                <CheckCircle size={20} />
                              ) : (
                                <Circle size={20} />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteOption(optIndex)}
                              className="text-red-500 hover:text-red-700 p-1"
                              disabled={
                                currentQuestion.options &&
                                currentQuestion.options.length <= 1
                              }
                            >
                              <X size={16} />
                            </Button>
                          </>
                        ) : (
                          <div
                            className={cn(
                              o.isCorrect && "text-green-600 font-semibold"
                            )}
                          >
                            <TextWithImages
                              text={o.text}
                              images={currentQuestion.images || []}
                            />
                          </div>
                        )}
                      </div>
                    );
                  }
                )}

                {isEditing && (
                  <div className="pl-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAddOption}
                      className="mt-2"
                    >
                      Add Option
                    </Button>
                  </div>
                )}
              </div>

              {/* Explanation */}
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold mb-1">Explanation:</p>
                {isEditing ? (
                  <Textarea
                    className="w-full"
                    value={currentQuestion.explanation || ""}
                    onChange={(e) => handleExplanationChange(e.target.value)}
                    placeholder="Enter explanation..."
                    rows={3}
                  />
                ) : (
                  <div className="ml-2">
                    <TextWithImages
                      text={
                        currentQuestion.explanation || "No explanation provided"
                      }
                      images={currentQuestion.images || []}
                    />
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold mb-1">Tags:</p>
                {isEditing ? (
                  <TagInput
                    currentQuestion={currentQuestion}
                    dispatch={dispatch}
                    allTags={allTags}
                  />
                ) : (
                  <div className="ml-2">
                    {currentQuestion.tags && currentQuestion.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {currentQuestion.tags.map(
                          (tag: string, tagIndex: number) => (
                            <span
                              key={tagIndex}
                              className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md border"
                            >
                              {tag}
                            </span>
                          )
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500 italic ml-2">
                        No tags
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Images */}
              {isEditing && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold">Images</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={triggerAddImage}
                    >
                      <ImagePlus size={16} className="mr-1" />
                      Add Image
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(currentQuestion.images || []).map(
                      (img: any, imgIndex: number) => (
                        <div
                          key={`${q.id || qIndex}-img-${img.tag}`}
                          className="relative group"
                        >
                          <div className="rounded-lg border p-2 aspect-square bg-gray-50">
                            <img
                              src={img.data}
                              alt={img.tag}
                              className="w-full h-full object-contain rounded"
                            />
                          </div>
                          <div className="mt-2 flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleCopyImageTag(img.tag)}
                                className="text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors cursor-pointer"
                                title={`Click to copy $${img.tag}$`}
                              >
                                {img.tag}
                              </button>
                              <button
                                onClick={() => handleCopyImageTag(img.tag)}
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                title={`Copy $${img.tag}$`}
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteImage(img.tag)}
                              className="h-5 w-5 rounded-full p-0"
                            >
                              <X size={10} />
                            </Button>
                          </div>
                        </div>
                      )
                    )}

                    {(!currentQuestion.images ||
                      currentQuestion.images.length === 0) && (
                      <div className="col-span-full text-center text-gray-500 text-sm py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        No images added yet. Click "Add Image" to get started.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default Questions;
