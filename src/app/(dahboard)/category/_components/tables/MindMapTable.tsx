import NothingFound from "@/app/_components/NothingFound";
import useContentStore, { MindMap } from "@/store/content";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Loader from "@/app/_components/Loader";
import Link from "next/link";
import { Edit2Icon, EyeIcon, LoaderCircle, Trash2Icon } from "lucide-react";
import AddMindMap from "../forms/AddMindMap";

const MindMapTable = ({ topicId }: { topicId: string }) => {
  const { mindMaps, loadingMindMaps, fetchMindMaps, deleteMindMap } =
    useContentStore();
  const [deleteId, setDeleteId] = useState("");
  const [editId, setEditId] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchMindMaps(topicId);
  }, [fetchMindMaps, topicId]);

  const handleDelete = async (id: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this mind-map?"
    );

    if (confirm) {
      setDeleteId(id);
      await deleteMindMap(id);
      setDeleteId("");
    }
  };

  const mindMapColumn: ColumnDef<MindMap>[] = [
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
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        return row.original?.description || "N/A";
      },
    },
    {
      accessorKey: "actions",
      header: () => <p className="text-end pr-2">Actions</p>,
      cell: ({ row }) => {
        return (
          <div className="w-full flex justify-end items-center gap-2">
            <Link href={`/category/${topicId}/mind-map?id=${row.original.id}`}>
              <EyeIcon size={16} />
            </Link>
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
    data: mindMaps,
    columns: mindMapColumn,
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
          {loadingMindMaps ? (
            <TableRow>
              <TableCell
                colSpan={mindMapColumn.length}
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
                colSpan={mindMapColumn.length}
                className="h-24 text-center"
              >
                <NothingFound text="No subjects found!" />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AddMindMap
        open={open}
        setOpen={setOpen}
        isEdit={true}
        mindMapId={editId}
      />
    </div>
  );
};

export default MindMapTable;
