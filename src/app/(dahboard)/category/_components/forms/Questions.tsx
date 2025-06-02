import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import useContentStore, { Question, TaggedImg } from "@/store/content";
import React, { useEffect, useMemo, useState } from "react";
import TextWithImages from "./TextWithImage";
import Loader from "@/app/_components/Loader";
import { LoaderCircle, Trash2Icon } from "lucide-react";

const Questions = ({
  topicId,
  isUpload = false,
  parsedQuestions = [],
}: {
  topicId: string;
  isUpload?: boolean;
  parsedQuestions?: Question[];
}) => {
  const {
    questions: storeQuestions,
    fetchQuestions,
    loadingQuestions,
    deleteQuestion,
  } = useContentStore();
  const [deleteId, setDeleteId] = useState("");
  const [localUploadedQuestions, setLocalUploadedQuestions] =
    useState<Question[]>(parsedQuestions);

  useEffect(() => {
    fetchQuestions(topicId);
  }, [fetchQuestions, topicId]);

  const questions = useMemo(() => {
    if (!isUpload && localUploadedQuestions.length == 0) return storeQuestions;

    return localUploadedQuestions;
  }, [isUpload, storeQuestions, localUploadedQuestions]);

  useEffect(() => {
    console.log(localUploadedQuestions);
  }, [localUploadedQuestions]);

  const handleDelete = async (id: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (confirm && isUpload) {
      setLocalUploadedQuestions((prev) =>
        prev.filter((_, ind) => {
          return ind.toString() !== id.toString();
        })
      );
    } else if (confirm) {
      setDeleteId(id);
      await deleteQuestion(id);
      setDeleteId("");
    }
  };

  return (
    <div className="px-4 pb-4">
      {loadingQuestions ? (
        <Loader />
      ) : (
        questions.map((q, ind) => {
          return (
            <div key={q.id ?? ind}>
              <div
                className={cn(
                  "grid grid-cols-11 gap-1 items-start",
                  ind !== 0 && "mt-2"
                )}
              >
                <div className="col-span-10 flex gap-2">
                  <p>Q{ind + 1}:</p>
                  <TextWithImages
                    text={q.text}
                    images={(q.images ?? []) as unknown as TaggedImg[]}
                    className="flex-1"
                  />
                </div>

                <div className="col-span-1 flex justify-end pt-1">
                  {deleteId == q.id ? (
                    <LoaderCircle size={16} className="rotate" />
                  ) : (
                    <Trash2Icon
                      onClick={() => handleDelete(q.id ?? ind)}
                      size={16}
                      className="cursor-pointer text-red-600"
                    />
                  )}
                </div>
              </div>

              {q.options.map((o, optInd) => {
                const label = String.fromCharCode(65 + optInd);

                return (
                  <div key={o.id ?? optInd} className="grid grid-cols-10">
                    <p></p>
                    <p
                      className={cn(
                        "col-span-9",
                        o.isCorrect && "text-green-600"
                      )}
                    >
                      {label}){" "}
                      <TextWithImages
                        text={o.text}
                        images={(q.images ?? []) as unknown as TaggedImg[]}
                        className="col-span-9"
                      />
                    </p>
                  </div>
                );
              })}

              <p className="mt-1 text-sm text-muted-foreground">
                Explanation:{" "}
                <TextWithImages
                  text={q.explanation}
                  images={(q.images ?? []) as unknown as TaggedImg[]}
                  className="col-span-9"
                />
              </p>

              {/* Add separator after each question except the last one */}
              {ind !== questions.length - 1 && <Separator className="my-4" />}
            </div>
          );
        })
      )}
    </div>
  );
};

export default Questions;
