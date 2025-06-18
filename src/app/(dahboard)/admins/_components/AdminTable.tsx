"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Admin } from "@prisma/client";
import useAdminStore from "@/store/admin";
import { useEffect } from "react";

const AdminTable = () => {
  const { fetchAdmins, admins } = useAdminStore();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const columns: ColumnDef<Partial<Admin>>[] = [
    {
      accessorKey: "serial",
      header: "S No.",
      cell: ({ row }) => row.index + 1, // this gives the current row number
    },
    {
      accessorKey: "fullName",
      header: "Fullname",
    },
    {
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <button
          onClick={() => {
            const confirmed = window.confirm(
              "Are you sure you want to delete this admin?"
            );
            if (confirmed) {
              deleteAdmin(row.original.id ?? "");
            }
          }}
          className="text-red-500 hover:underline"
        >
          Delete
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data: admins,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col items-end gap-3">


      <div className="rounded-md border w-full">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminTable;
