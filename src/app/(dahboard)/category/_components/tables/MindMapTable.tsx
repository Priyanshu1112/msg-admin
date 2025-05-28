import NothingFound from "@/app/_components/NothingFound";
import useContentStore, { MindMap } from "@/store/content";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Loader from "@/app/_components/Loader";

const MindMapTable = ({ topicId }: { topicId: string }) => {
  const { mindMaps, loadingMindMaps, fetchMindMaps } = useContentStore();

  useEffect(() => {
    fetchMindMaps(topicId);
  }, [fetchMindMaps, topicId]);

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
        return row.original?.description ?? "N/A";
      },
    },
    {
      accessorKey: "actions",
      header: () => <p className="text-end pr-2">Actions</p>,
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
    </div>
  );
};

export default MindMapTable;
