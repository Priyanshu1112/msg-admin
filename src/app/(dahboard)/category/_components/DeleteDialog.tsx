import { ReactNode, useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import useCategoryStore from "@/store/category";
import Loader from "@/app/_components/Loader";
import { AlertTriangle, Trash2 } from "lucide-react";

interface DeleteCategoryDialogProps {
  category: "subject" | "chapter" | "topic";
  itemName?: string;
  onConfirm: () => Promise<void>;
  children: ReactNode;
}

export function DeleteCategoryDialog({
  category,
  itemName,
  onConfirm,
  children,
}: DeleteCategoryDialogProps) {
  const { deletingChapter, deletingSubject, deletingTopic } =
    useCategoryStore();

  const [open, setOpen] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const isDeleting =
    localLoading || deletingChapter || deletingSubject || deletingTopic;

  // Reset to step 1 when dialog opens
  useEffect(() => {
    if (open) {
      setStep(1);
    }
  }, [open]);

  const getFirstStepMessage = () => {
    const baseMessage = {
      subject:
        "Deleting this subject will also delete ALL its chapters, topics, mind maps, questions, and their content.",
      chapter:
        "Deleting this chapter will also delete ALL its topics, mind maps, questions, and their content.",
      topic:
        "Deleting this topic will also delete ALL its mind maps, questions, and content.",
    };
    return baseMessage[category];
  };

  const getImpactDetails = () => {
    switch (category) {
      case "subject":
        return [
          "All chapters in this subject",
          "All topics in all chapters",
          "All mind maps for all topics",
          "All questions and their options",
          "All related content and metadata",
        ];
      case "chapter":
        return [
          "All topics in this chapter",
          "All mind maps for all topics",
          "All questions and their options",
          "All related content and metadata",
        ];
      case "topic":
        return [
          "All mind maps for this topic",
          "All questions and their options",
          "All related content and metadata",
        ];
    }
  };

  const handleFirstConfirm = () => {
    setStep(2);
  };

  const handleFinalConfirm = async () => {
    setLocalLoading(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

      <AlertDialogContent className="max-w-md">
        {step === 1 ? (
          // First Confirmation Step
          <>
            <AlertDialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <AlertDialogTitle className="text-lg">
                    Delete {category}?
                  </AlertDialogTitle>
                  {itemName && (
                    <p className="text-sm text-muted-foreground mt-1">
                      &quot;{itemName}&quot;
                    </p>
                  )}
                </div>
              </div>
            </AlertDialogHeader>

            <div className="space-y-4">
              <AlertDialogDescription className="text-base">
                {getFirstStepMessage()}
              </AlertDialogDescription>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">
                  This will permanently delete:
                </h4>
                <ul className="space-y-1 text-sm text-red-700">
                  {getImpactDetails().map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800 font-medium">
                  ⚠️ This action cannot be undone
                </p>
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancel}>
                Cancel
              </AlertDialogCancel>
              <Button
                onClick={handleFirstConfirm}
                className="bg-red-600 hover:bg-red-700"
              >
                Continue
              </Button>
            </AlertDialogFooter>
          </>
        ) : (
          // Second Step - Simple Final Warning Only
          <>
            <AlertDialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <AlertDialogTitle className="text-xl text-red-600 font-bold">
                    ⚠️ FINAL WARNING
                  </AlertDialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    This is your last chance to cancel
                  </p>
                </div>
              </div>
            </AlertDialogHeader>

            <div className="space-y-4">
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 text-center">
                <h3 className="text-lg font-bold text-red-800 mb-2">
                  You are about to permanently delete this {category}!
                </h3>
                {itemName && (
                  <p className="text-md font-medium text-red-700 mb-3">
                    &quot;{itemName}&quot;
                  </p>
                )}
                <p className="text-red-700">
                  This action <strong>CANNOT BE UNDONE</strong> and will delete
                  all related data.
                </p>
              </div>

              <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 text-center">
                <p className="text-amber-800 font-medium">
                  💡 If you&apos;re not 100% sure, click &quot;Cancel&quot;
                </p>
              </div>
            </div>

            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel
                onClick={handleCancel}
                disabled={isDeleting}
                className="flex-1"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleFinalConfirm}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 flex-1"
              >
                {isDeleting ? (
                  <div className="flex items-center gap-2">
                    <Loader size={16} />
                    Deleting...
                  </div>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
