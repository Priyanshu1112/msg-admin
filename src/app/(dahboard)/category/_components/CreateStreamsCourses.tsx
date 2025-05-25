import Loader from "@/app/_components/Loader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import useCategoryStore from "@/store/category";
import { Check, PlusIcon } from "lucide-react";
import { useMemo, useState } from "react";

export function CreateStreamCourse({
  isStream = true,
  streamId,
  icon = false,
}: {
  isStream?: boolean;
  icon?: boolean;
  streamId?: string;
}) {
  const {
    creatingCourse,
    streams,
    creatingStream,
    createCourse,
    createStream,
  } = useCategoryStore();
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);

  const text = isStream ? "Stream" : "Course";

  const handleClick = async () => {
    if (isStream) await createStream(name);
    else if (streamId) await createCourse(name, streamId);

    setName("");
    setOpen(false);
  };

  const isPresent = useMemo(() => {
    if (isStream) {
      return streams.find((st) => st.name == name);
    } else {
      return streams.find((st) => st?.course?.find((c) => c.name == name));
    }
  }, [name, streams, isStream]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {icon ? (
          <PlusIcon size={16} className="cursor-pointer text-slate-800" />
        ) : (
          <Button
            size={icon ? "icon" : "sm"}
            variant={"outline"}
            className={cn("cursor-pointer", icon && "border-none p-0 size-8")}
          >
            Create {text}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create {text}</DialogTitle>
          <DialogDescription>
            Enter unique {text.toLocaleLowerCase()} name{" "}
            {!isStream &&
              `for ${streams.find((st) => st.id == streamId)?.name}`}
            .
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 ">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="name" className="sr-only">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(
                isPresent ? "focus-visible:ring-red-400 border-red-500" : ""
              )}
              placeholder={`Enter ${text} name...`}
            />
            {isPresent && (
              <p className="text-sm text-red-500 font-medium mt-0.5">
                Name already exists!
              </p>
            )}
          </div>
          <Button
            disabled={name.length == 0}
            type="submit"
            size="sm"
            onClick={handleClick}
            className="px-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {creatingCourse || creatingStream ? <Loader /> : <Check />}
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
              className="cursor-pointer"
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
