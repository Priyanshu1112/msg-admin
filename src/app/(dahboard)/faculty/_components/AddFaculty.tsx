import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import useFacultyStore from "@/store/faculty";
import Loader from "@/app/_components/Loader";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  qualification: z.string().min(1, "Qualification is required"),
  bio: z.string().min(1, "Bio is required"),
  image: z.any().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AddFacultySheet() {
  const { createFaculty, creatingFaculty } = useFacultyStore();

  const [open, setOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      qualification: "",
      bio: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("qualification", data.qualification);
    formData.append("bio", data.bio);

    if (data.image?.[0]) {
      const file = data.image[0];
      const base64 = await convertToBase64(file);
      formData.append("image", base64);
    }

    console.log("Submit faculty:", Object.fromEntries(formData.entries()));

    await createFaculty(formData);

    setOpen(false);
    form.reset();
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="cursor-pointer">
          <Plus className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[480px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Add New Faculty</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 overflow-auto p-4 space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Dr. Farzana Thaseen" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="qualification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qualification</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="B.D.S. MFD(RCSI)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Brief introduction and achievements"
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => field.onChange(e.target.files)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <SheetFooter className="p-4 border-t mt-auto">
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            className="w-full disabled:opacity-50"
            disabled={creatingFaculty}
          >
            {creatingFaculty ? <Loader size={16} /> : "Save Faculty"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
