import useCategoryStore, { Chapter } from "@/store/category";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import NothingFound from "@/app/_components/NothingFound";
import { useEffect, useState } from "react";
import { Edit2Icon, LoaderCircle, PlusIcon, Trash2 } from "lucide-react";
import AddCategory from "../forms/AddCategory";
import ToolTip from "@/app/_components/ToolTip";
import { DeleteCategoryDialog } from "../DeleteDialog";

const ChapterTable = () => {
  const { chapters, fetchChapters, setActiveChapterId, deleteChapter } =
    useCategoryStore();
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    await deleteChapter(id);
    setOpen(false);
    setDeleteId("");
  };

  const chapterColumn: ColumnDef<Chapter>[] = [
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
      accessorKey: "subject.name",
      header: "Subject",
    },
    {
      accessorKey: "_count.topics",
      header: "Topics",
    },
    {
      accessorKey: "_count.mindMaps",
      header: "Mind maps",
    },
    {
      accessorKey: "_count.questions",
      header: "Questions",
    },
    {
      accessorKey: "actions",
      header: () => <p className="text-end pr-2">Actions</p>,
      cell: ({ row }) => {
        return (
          <div className="flex gap-2 items-center justify-end pr-2">
            <ToolTip content="Add topic">
              <PlusIcon
                size={16}
                className="cursor-pointer"
                onClick={() => {
                  setActiveChapterId(row.original.id);
                  setOpen(true);
                }}
              />
            </ToolTip>
            <ToolTip content="Edit">
              <Edit2Icon
                size={16}
                className="cursor-pointer"
                onClick={() => {
                  setActiveChapterId(row.original.id);
                  setEdit(true);
                }}
              />
            </ToolTip>
            {deleteId == row.original.id ? (
              <LoaderCircle size={16} className="rotate" />
            ) : (
              <DeleteCategoryDialog
                category="chapter"
                onConfirm={() => handleDelete(row.original.id)}
              >
                <Trash2 size={16} className="cursor-pointer text-red-600" />
              </DeleteCategoryDialog>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: chapters,
    columns: chapterColumn,
    getCoreRowModel: getCoreRowModel(),
  });

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
          {table.getRowModel().rows?.length ? (
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
                colSpan={chapterColumn.length}
                className="h-24 text-center"
              >
                <NothingFound text="No chapters found!" />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {open && (
        <AddCategory
          activeTab="topic"
          trigger={false}
          open={open}
          onOpenChange={setOpen}
        />
      )}

      {edit && (
        <AddCategory
          activeTab="chapter"
          trigger={false}
          open={edit}
          onOpenChange={setEdit}
          edit={true}
        />
      )}
    </div>
  );
};

export default ChapterTable;
