import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import useCategoryStore from "@/store/category";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Loader from "@/app/_components/Loader";
import NothingFound from "@/app/_components/NothingFound";
import { CreateStreamCourse } from "./CreateStreamsCourses";
import { Trash2Icon } from "lucide-react";

const StreamsCourses = () => {
  const { loadingStreams, streams, fetchStreams, deleteStream, deleteCourse } =
    useCategoryStore();
  const [deleteId, setDeleteId] = useState("");

  useEffect(() => {
    fetchStreams();
  }, [fetchStreams]);

  const handleStreamDelete = async (id: string) => {
    setDeleteId(id);
    await deleteStream(id);
    setDeleteId("");
  };

  const handleCourseDelete = async (id: string) => {
    setDeleteId(id);
    await deleteCourse(id);
    setDeleteId("");
  };

  return (
    <Sheet>
      {/* Wrap the tooltip with a fragment and move Button outside */}
      <SheetTrigger asChild>
        <Button size={"sm"} variant={"outline"} className="cursor-pointer">
          Streams & Courses
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col h-full">
        <SheetHeader className="sticky top-0 bg-white z-10 flex justify-between">
          <SheetTitle>Streams & Courses</SheetTitle>
          {streams.length > 0 && <CreateStreamCourse />}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6">
          {loadingStreams ? (
            <Loader />
          ) : streams.length > 0 ? (
            streams.map((st) => (
              <Accordion type="single" collapsible key={st.id}>
                <AccordionItem value="item-1">
                  <AccordionTrigger icon={(st?.course?.length ?? 0) > 0}>
                    <div className="flex items-center justify-between w-full group">
                      <span>{st.name}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <CreateStreamCourse
                          isStream={false}
                          streamId={st.id}
                          icon={true}
                        />
                        {st.id == deleteId ? (
                          <Loader size={16} />
                        ) : (
                          <Trash2Icon
                            size={16}
                            className="cursor-pointer text-red-600"
                            onClick={() => handleStreamDelete(st.id)}
                          />
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  {st?.course?.map((c) => (
                    <AccordionContent
                      key={c.id}
                      className="pl-4 flex justify-between items-center"
                    >
                      {c.name}{" "}
                      {c.id == deleteId ? (
                        <Loader size={14} />
                      ) : (
                        <Trash2Icon
                          size={14}
                          className="cursor-pointer text-red-500"
                          onClick={() => handleCourseDelete(c.id)}
                        />
                      )}
                    </AccordionContent>
                  ))}
                </AccordionItem>
              </Accordion>
            ))
          ) : (
            <NothingFound text="No streams and courses found!">
              <CreateStreamCourse />
            </NothingFound>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StreamsCourses;
