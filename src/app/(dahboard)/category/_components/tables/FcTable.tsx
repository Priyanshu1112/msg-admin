import { useEffect, useState } from "react";
import NothingFound from "@/app/_components/NothingFound";
import useContentStore, { QuestionBundle } from "@/store/content";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Loader from "@/app/_components/Loader";
import { Edit2Icon, EyeIcon, LoaderCircle, Trash2Icon } from "lucide-react";
import PreviewQuestions from "../PreviewQuestions";
import AddContentSheet from "../forms/AddContentSheet";
import PreviewFc from "../PreviewFc";

const FcTable = ({ topicId }: { topicId: string }) => {
  const {
    fetchFlashCardBundles,
    fcBundles,
    loadingFcBundles,
    deleteFlashCardBundle,
  } = useContentStore();

  const [deleteId, setDeleteId] = useState("");
  const [editId, setEditId] = useState("");
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [previewId, setPreviewId] = useState("");

  useEffect(() => {
    fetchFlashCardBundles(topicId);
  }, [fetchFlashCardBundles, topicId]);

  const questionColumn: ColumnDef<QuestionBundle>[] = [
    {
      id: "serial", // no accessorKey needed for custom columns
      header: "S No.",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "_count.flashCards",
      header: "FlashCards",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "actions",
      header: () => <p className="text-end pr-2">Actions</p>,
      cell: ({ row }) => {
        return (
          <div className="w-full flex justify-end items-center gap-2">
            <EyeIcon
              size={16}
              className="cursor-pointer"
              onClick={() => {
                setPreviewId(row.original.id);
                setPreview(true);
              }}
            />
            <Edit2Icon
              size={16}
              className="cursor-pointer"
              onClick={() => {
                setEditId(row.original.id);
                setOpen(true);
              }}
            />
            {deleteId == row.original.id ? (
              <LoaderCircle size={16} className="rotate" />
            ) : (
              <Trash2Icon
                onClick={() => handleDelete(row.original.id)}
                size={16}
                className="cursor-pointer text-red-600"
              />
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: fcBundles,
    columns: questionColumn,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleDelete = async (id: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this bundle?"
    );

    if (confirm) {
      setDeleteId(id);
      await deleteFlashCardBundle(id);
      setDeleteId("");
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loadingFcBundles ? (
            <TableRow>
              <TableCell
                colSpan={questionColumn.length}
                className="h-24 text-center"
              >
                <Loader />
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={questionColumn.length}
                className="h-24 text-center"
              >
                <NothingFound text="No subjects found!" />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* <AddQuestion
        open={open}
        setOpen={setOpen}
        isEdit={true}
        bundleId={editId}

      /> */}

      <AddContentSheet
        open={open}
        existingId={editId}
        isEdit={true}
        setOpen={setOpen}
        type="flashcard"
      />

      {previewId && (
        <PreviewFc
          open={preview}
          setOpen={setPreview}
          bundleId={previewId}
          trigger={false}
        />
      )}
    </div>
  );
};

export default FcTable;
