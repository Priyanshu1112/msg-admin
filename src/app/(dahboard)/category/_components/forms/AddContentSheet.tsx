import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ContentCard } from "../ContentCard";
import Loader from "@/app/_components/Loader";
import useAppStore from "@/store/app";
import useContentStore from "@/store/content";
import { parseMindMap } from "@/app/(dahboard)/_parser/mind-map";
import { parseDocxQuestions } from "@/app/(dahboard)/_parser/mcq";
import { parseDocxFlashCards } from "@/app/(dahboard)/_parser/flash-cards";

export type ContentType = "mindmap" | "question" | "flashcard";

interface AddContentSheetProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedFiles?: FileList | null;
  topicId?: string;
  type: ContentType;
  isEdit?: boolean;
  existingId?: string;
}

const AddContentSheet = ({
  open,
  setOpen,
  selectedFiles,
  topicId,
  type,
  isEdit = false,
  existingId = "",
}: AddContentSheetProps) => {
  const { setError } = useAppStore();
  const {
    creatingMindMaps,
    createMindMaps,
    updateMindMap,
    mindMaps,
    creatingQuestions,
    createQuestionBundles,
    creatingQuestionBundles,
    questionBundles,
    fcBundles,
    createFlashCardBundles,
    creatingFcBundles,
  } = useContentStore();

  const [parsed, setParsed] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const parse = async () => {
      if (!selectedFiles || selectedFiles.length === 0) return;
      setIsLoading(true);

      try {
        if (type === "mindmap") {
          const maps = await Promise.all(
            Array.from(selectedFiles).map(async (file) => ({
              name: file.name.replace(".xlsx", ""),
              mindMap: await parseMindMap(file),
              description: "",
            }))
          );
          setParsed(maps);
        } else if (type === "question") {
          const questions = await Promise.all(
            Array.from(selectedFiles).map(async (file) => ({
              name: file.name.replace(".docx", ""),
              questions: await parseDocxQuestions(file),
              description: "",
            }))
          );
          setParsed(questions.flat());
        } else if (type === "flashcard") {
          const flashcards = await Promise.all(
            Array.from(selectedFiles).map(async (file) => ({
              name: file.name.replace(".docx", ""),
              flashcards: await parseDocxFlashCards(file),
              description: "",
            }))
          );
          setParsed(flashcards.flat());
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Parsing failed.");
      } finally {
        setIsLoading(false);
      }
    };

    if (open && !isEdit) parse();
    else if (isEdit) {
      if (type === "mindmap") {
        const found = mindMaps.find((m) => m.id === existingId);
        if (found)
          setParsed([{ ...found, mindMap: JSON.parse(found.mindMap as any) }]);
      } else if (type === "question") {
        const found = questionBundles.find((q) => q.id === existingId);
        if (found) setParsed([found]);
      } else if (type === "flashcard") {
        const found = fcBundles.find((f) => f.id === existingId);
        if (found) setParsed([found]);
      }
    }
  }, [open, selectedFiles]);

  const handleSubmit = async () => {
    if (!topicId && !isEdit) return;

    if (type === "mindmap") {
      if (isEdit)
        await updateMindMap({ mindMapId: existingId!, mindMap: parsed[0] });
      else await createMindMaps({ topicId: topicId!, mindMaps: parsed });
    } else if (type === "question") {
      await createQuestionBundles({ topicId: topicId!, bundles: parsed });
    } else if (type === "flashcard") {
      await createFlashCardBundles({ topicId: topicId!, bundles: parsed });
    }

    setOpen(false);
    setParsed([]);
  };

  const handleClose = () => {
    setOpen(false);
    setParsed([]);
  };

  const updateName = (index: number, value: string) => {
    setParsed((prev) =>
      prev.map((item, i) => (i === index ? { ...item, name: value } : item))
    );
  };

  const updateDescription = (index: number, value: string) => {
    setParsed((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, description: value } : item
      )
    );
  };

  const loading = isLoading;
  const creating =
    type === "mindmap"
      ? creatingMindMaps
      : type === "question"
      ? creatingQuestions || creatingQuestionBundles || creatingFcBundles
      : false;

  //   : creatingFlashCards;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger />
      <SheetContent className="min-w-[50vw] flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>
            {isEdit ? "Edit" : "Add"}{" "}
            {type === "mindmap"
              ? "Mind Maps"
              : type === "question"
              ? "Questions"
              : "Flash Cards"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <Loader size={32} />
                <p className="mt-2 text-sm text-muted-foreground">
                  Parsing files...
                </p>
              </div>
            </div>
          ) : parsed.length > 0 ? (
            <>
              {!isEdit && (
                <p className="text-sm text-muted-foreground">
                  {parsed.length} file(s) parsed successfully.
                </p>
              )}
              {parsed.map((item, i) => (
                <ContentCard
                  key={i}
                  index={i}
                  title={
                    type === "mindmap"
                      ? "Mind Map"
                      : type === "question"
                      ? "Bundle"
                      : "Flash Card Bundle"
                  }
                  name={item.name}
                  onNameChange={(val) => updateName(i, val)}
                  description={item.description}
                  onDescriptionChange={(val) => {
                    console.log(val);
                    updateDescription(i, val);
                  }}
                  footer={
                    type === "question"
                      ? `${item.questions?.length ?? 0} Questions`
                      : type === "flashcard"
                      ? `${item.flashcards?.length ?? 0} Flash Cards`
                      : undefined
                  }
                />
              ))}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No files selected or parsing failed.
              </p>
            </div>
          )}
        </div>

        <SheetFooter className="border-t p-4">
          <div className="flex justify-end space-x-2 w-full">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || creating || parsed.length === 0}
            >
              {loading || creating ? (
                <>
                  <Loader size={16} />
                  <span className="ml-2">
                    {loading ? "Submitting.." : "Creating..."}
                  </span>
                </>
              ) : isEdit ? (
                "Update"
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddContentSheet;
