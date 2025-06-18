import useCategoryStore from "@/store/category";
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
import { Edit2Icon, LoaderCircle, Trash2 } from "lucide-react";
import { DeleteCategoryDialog } from "../DeleteDialog";
import { Button } from "@/components/ui/button";
import AddCategory from "../forms/AddCategory";
import AddContent from "../forms/AddContent";

const TopicTable = () => {
  const { topics, fetchTopics, setActiveTopicId, deleteTopic } =
    useCategoryStore();
  // const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    await deleteTopic(id);
    // setOpen(false);
    setDeleteId("");
  };

  const topicColumn: ColumnDef<Topic>[] = [
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
      accessorKey: "chapter.name",
      header: "Chapter",
    },
    {
      accessorKey: "_count.mindMaps",
      header: "Mind maps",
    },
    {
      accessorKey: "_count.question",
      header: "Questions",
    },
    {
      accessorKey: "_count.flashCard",
      header: "Flash cards",
    },
    {
      accessorKey: "_count.video",
      header: "Videos",
    },
    {
      accessorKey: "actions",
      header: () => <p className="text-end pr-2">Actions</p>,
      cell: ({ row }) => {
        return (
          <div className="flex gap-2 items-center justify-end pr-2">
            <AddContent
              topic={{ id: row.original.id, name: row.original.name }}
            >
              <Button
                size={"sm"}
                variant={"outline"}
                className="text-sm cursor-pointer bg-transparent hover:bg-white"
              >
                Add Content
              </Button>
            </AddContent>
            <Edit2Icon
              size={16}
              className="cursor-pointer"
              onClick={() => {
                setActiveTopicId(row.original.id);
                setEdit(true);
              }}
            />
            {deleteId == row.original.id ? (
              <LoaderCircle size={16} className="rotate" />
            ) : (
              <DeleteCategoryDialog
                category="topic"
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
    data: topics,
    columns: topicColumn,
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
                colSpan={topicColumn.length}
                className="h-24 text-center"
              >
                <NothingFound text="No topics found!" />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {edit && (
        <AddCategory
          activeTab="topic"
          trigger={false}
          open={edit}
          onOpenChange={setEdit}
          edit={true}
        />
      )}
    </div>
  );
};

export default TopicTable;
