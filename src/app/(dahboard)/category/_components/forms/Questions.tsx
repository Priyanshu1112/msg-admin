import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import useContentStore, { Question, TaggedImg } from "@/store/content";
import React, { useEffect, useMemo } from "react";
import TextWithImages from "./TextWithImage";
import Loader from "@/app/_components/Loader";

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
  } = useContentStore();

  useEffect(() => {
    fetchQuestions(topicId);
  }, [fetchQuestions, topicId]);

  const questions = useMemo(() => {
    if (!isUpload && parsedQuestions.length == 0) return storeQuestions;

    return parsedQuestions;
  }, [isUpload, parsedQuestions, storeQuestions]);

  return (
    <div className="px-4 pb-4">
      {loadingQuestions ? (
        <Loader />
      ) : (
        questions.map((q, ind) => {
          return (
            <div key={q.id ?? ind}>
              <div
                className={cn("grid grid-cols-10 gap-1", ind !== 0 && "mt-2")}
              >
                <p>Q{ind + 1}:</p>
                {/* <p className="col-span-9">{q.text}</p> */}
                <TextWithImages
                  text={q.text}
                  images={(q.images ?? []) as unknown as TaggedImg[]}
                  className="col-span-9"
                />
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
