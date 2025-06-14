"use client";

import { useEffect, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import AddFacultySheet from "./_components/AddFaculty";
import useFacultyStore from "@/store/faculty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import NothingFound from "@/app/_components/NothingFound";
import { Faculty } from "@prisma/client";

const FacultyTablePage = () => {
  const { faculties, fetchFaculties, loadingFaculty, deleteFaculty } =
    useFacultyStore();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState("");

  const columns: ColumnDef<Faculty>[] = [
    {
      header: "S No",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "qualification",
      header: "Qualification",
    },
    {
      accessorKey: "bio",
      header: "Bio",
      cell: ({ row }) => (
        <div className="line-clamp-3 max-w-xs text-sm text-muted-foreground">
          {row.original.bio}
        </div>
      ),
    },
    {
      accessorKey: "imageUrl",
      header: "Image",
      cell: ({ row }) =>
        row.original.imageUrl ? (
          <Image
            src={row.original.imageUrl}
            alt={row.original.name}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="text-xs italic text-muted-foreground">No image</div>
        ),
    },
    {
      id: "actions",
      header: () => <p className="text-end pr-2">Actions</p>,
      cell: ({ row }) => (
        <div className="flex gap-2 items-center justify-end pr-2">
          <Button variant="ghost" size="icon">
            <Pencil className="w-4 h-4" />
          </Button>
          {deleteId == row.original.id ? (
            <LoaderCircle size={16} className="rotate" />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    const confirm = window.confirm(
      "Are you sure you want to delete this facutly?"
    );

    if (confirm) await deleteFaculty(id);

    setDeleteId("");
  };

  const table = useReactTable<Faculty>({
    data: faculties,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    fetchFaculties();
  }, [fetchFaculties]);

  return (
    <div className="px-2">
      <h1 className="capitalize text-3xl py-3 px-2 bg-gray-100 rounded-md mb-4">
        Faculty Members
      </h1>
      <div className="flex gap-4 pb-4 items-center justify-end w-[400px] ml-auto">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <AddFacultySheet />
      </div>

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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <NothingFound text="No faculties found!" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FacultyTablePage;
