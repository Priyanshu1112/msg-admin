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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { countries } from "@/contants/countries";
import useCategoryStore, { Subject } from "@/store/category";
import Loader from "@/app/_components/Loader";
import { MultiSelect, SearchableSelect } from "../FormSelects";

// Schemas
const subjectSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  country: z.string().min(1, { message: "Country must be selected." }),
  stream: z.string().min(1, { message: "Stream must be selected." }),
  course: z.string().optional(),
  year: z.array(z.number()).min(1, { message: "Year must be selected." }),
});

// Constants
export const yearOptions = [
  { value: 1, label: "1st Year" },
  { value: 2, label: "2nd Year" },
  { value: 3, label: "3rd Year" },
  { value: 4, label: "4th Year" },
  { value: 5, label: "5th Year" },
];

const countryOptions = countries.map((countryObj) => {
  const [code, data] = Object.entries(countryObj)[0];
  return {
    value: code,
    label: data.country,
  };
});

export interface SubjectFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: boolean;
  edit?: boolean;
}

const AddSubjectForm = ({
  open = false,
  onOpenChange,
  trigger = true,
  edit = false,
}: SubjectFormProps) => {
  const {
    streams,
    createSubject,
    creatingSubject,
    activeSubjectId,
    subjects,
    updateSubject,
    updatingSubject,
  } = useCategoryStore();
  const [isOpen, setIsOpen] = useState(open);

  const activeSubject: Subject | undefined = useMemo(() => {
    if (edit && activeSubjectId)
      return subjects.find((sub) => sub.id == activeSubjectId);
  }, [subjects, activeSubjectId, edit]);

  const form = useForm<z.infer<typeof subjectSchema>>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      country: "",
      stream: "",
      course: "",
      year: [],
    },
  });

  const currentStream = form.watch("stream");

  useEffect(() => {
    if (activeSubject) {
      form.reset({
        name: activeSubject.name,
        country: activeSubject.country,
        stream: activeSubject.stream.id,
        course: activeSubject?.course?.id ?? "",
        year: activeSubject.year,
      });
    }
  }, [activeSubject, form]);

  const selectedStreamCourses = useMemo(() => {
    if (!currentStream) return [];
    return streams.find((st) => st.id === currentStream)?.course ?? [];
  }, [currentStream, streams]);

  const isCourseRequired = useMemo(() => {
    return (selectedStreamCourses?.length ?? 0) > 0;
  }, [selectedStreamCourses]);

  useEffect(() => {
    if (!activeSubject || currentStream != activeSubject.stream.id) {
      form.setValue("course", "");
    }
  }, [currentStream, form, activeSubject, isCourseRequired]);

  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  }, [isOpen, onOpenChange]);

  const onSubmit = async (data: z.infer<typeof subjectSchema>) => {
    if (isCourseRequired && !data.course) {
      form.setError("course", {
        type: "required",
        message: "Course must be selected.",
      });
      return;
    }

    if (edit && activeSubject) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatePayload: any = { id: activeSubjectId };

      if (data.name !== activeSubject.name) updatePayload.name = data.name;
      if (data.country !== activeSubject.country)
        updatePayload.country = data.country;
      if (data.stream !== activeSubject.stream.id)
        updatePayload.stream = data.stream;
      if (data.course !== activeSubject.course?.id)
        updatePayload.course = data.course;
      const isYearDifferent =
        data.year.length !== activeSubject.year.length ||
        data.year.some((y) => !activeSubject.year.includes(y));
      if (isYearDifferent) updatePayload.year = data.year;

      // Avoid sending only `id` if no fields changed
      const hasUpdates = Object.keys(updatePayload).length > 1;
      if (hasUpdates) await updateSubject(updatePayload);
    } else {
      await createSubject(data);
    }

    setIsOpen(false);
    form.reset();
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {trigger && (
        <ToolTip content="Add Subject">
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="cursor-pointer">
              <PlusIcon size={16} />
            </Button>
          </SheetTrigger>
        </ToolTip>
      )}

      <SheetContent className="flex flex-col h-full">
        <SheetHeader className="sticky top-0 bg-white z-10">
          <SheetTitle>{edit ? "Edit" : "Create"} Subject</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 p-6"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter subject name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        options={countryOptions}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select country"
                        searchPlaceholder="Search countries..."
                        emptyMessage="No country found."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stream"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stream</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select stream" />
                        </SelectTrigger>
                        <SelectContent>
                          {streams.map((stream) => (
                            <SelectItem key={stream.id} value={stream.id}>
                              {stream.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(selectedStreamCourses?.length ?? 0) > 0 && (
                <FormField
                  control={form.control}
                  name="course"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedStreamCourses?.map((course) => (
                              <SelectItem key={course.id} value={course.id}>
                                {course.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Years</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={yearOptions}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select years"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              disabled={creatingSubject || updatingSubject}
            >
              {creatingSubject || updatingSubject ? (
                <Loader />
              ) : edit ? (
                "Edit "
              ) : (
                "Create " + "Subject"
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddSubjectForm;
