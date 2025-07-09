import React, { useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import {  Trash2 } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { Dispatch, SetStateAction } from "react";
import useContentStore from "@/store/content";
import useFacultyStore from "@/store/faculty";
import Loader from "@/app/_components/Loader";

const embedUrlFromYouTube = (url: string) => {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

const schema = z.object({
  videos: z
    .array(
      z.object({
        url: z.string().url({ message: "Enter a valid URL" }),
        title: z.string().min(1, "Title is required"),
        facultyId: z.string().min(1, "Faculty is required"),
      })
    )
    .min(1, { message: "At least one video is required" }),
});

type FormData = z.infer<typeof schema>;

const AddVideo = ({
  topicId,
  open,
  setOpen,
}: {
  topicId: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const { createVideos, creatingVideos } = useContentStore();
  const { faculties, fetchFaculties } = useFacultyStore();

  useEffect(() => {
    fetchFaculties();
  }, [fetchFaculties]);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      videos: [{ url: "", title: "", facultyId: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "videos",
  });

  const onSubmit = async (data: FormData) => {
    const videos = data.videos
      .map((v) => {
        const embedUrl = embedUrlFromYouTube(v.url);
        return embedUrl
          ? { url: embedUrl, title: v.title, facultyId: v.facultyId }
          : null;
      })
      .filter(Boolean);

    await createVideos({ topicId, videos });
    setOpen(false);
    form.reset({ videos: [{ url: "", title: "", facultyId: "" }] });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild />
      <SheetContent className="h-full w-[480px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Add Videos</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 p-4 overflow-y-auto space-y-6"
          >
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4">
                <FormField
                  control={form.control}
                  name={`videos.${index}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter video title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`videos.${index}.url`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL</FormLabel>
                      <div className="flex gap-2 items-start">
                        <FormControl>
                          <Input {...field} placeholder="https://youtube/..." />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                      <FormMessage />
                      {embedUrlFromYouTube(field.value) && (
                        <>
                          <iframe
                            className="w-full aspect-video rounded-md mt-2"
                            src={embedUrlFromYouTube(field.value)!}
                            allowFullScreen
                          ></iframe>
                          <p className="text-sm text-muted-foreground break-all mt-1">
                            {field.value}
                          </p>
                        </>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`videos.${index}.facultyId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faculty</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full border rounded p-2 text-sm"
                        >
                          <option value="">Select faculty</option>
                          {faculties.map((faculty) => (
                            <option key={faculty.id} value={faculty.id}>
                              {faculty.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => append({ url: "", title: "", facultyId: "" })}
            >
              + Add another
            </Button>
          </form>
        </Form>

        <SheetFooter className="p-4 border-t mt-auto">
          <Button
            type="submit"
            disabled={creatingVideos}
            onClick={form.handleSubmit(onSubmit)}
            className="w-full disabled:opacity-50"
          >
            {creatingVideos ? <Loader size={16} /> : "Save Videos"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddVideo;
