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
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Edit2Icon, Trash2, EyeIcon, Loader2 } from "lucide-react";
import CreateBundle from "./CreateBundle";
import { fetchDELETE } from "@/store/_utils/fetchHelp";

interface FCBundle {
  id: string;
  name: string;
  year: number;
  tags: string[];
  description: string | null;
  createdAt: string;
  flashCardCount: number;
}

const FCBundleTable = ({
  bundles,
  setBundles,
}: {
  bundles: FCBundle[];
  setBundles: Dispatch<SetStateAction<FCBundle[]>>;
}) => {
  const [activeBundle, setActiveBundle] = useState<FCBundle>();
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string>("");

  const fetchBundles = async () => {
    try {
      const res = await fetch("/api/flashcard-bundle");
      const json = await res.json();
      if (json.success && json.data?.bundles) {
        setBundles(json.data.bundles);
      }
    } catch (err) {
      console.error("Failed to fetch bundles", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBundles();
  }, []);

  const handleDelete = async (id: string) => {
    const confrim = window.confirm(
      "Are you sure you want to delete this bundle? This action cannot be undone."
    );

    if (!confrim) return;

    setDeleteId(id);
    const res = await fetchDELETE("/api/flashcard-bundle/" + id);
    if (res.success) {
      setBundles((prev) => prev.filter((bundle) => bundle.id !== id));
    } else {
      alert("Failed to delete bundle");
    }
    setDeleteId("");
  };

  const bundleColumns: ColumnDef<FCBundle>[] = [
    {
      id: "serial",
      header: "S No.",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "year",
      header: "Year",
      cell: ({ getValue }) => `Year ${getValue()}`,
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ getValue }) => (getValue() as string[]).join(", "),
    },
    {
      accessorKey: "flashCardCount",
      header: "Flashcards",
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ getValue }) =>
        new Date(getValue() as string).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    {
      id: "actions",
      header: () => <p className="text-end pr-2">Actions</p>,
      cell: ({ row }) => (
        <div className="flex gap-2 items-center justify-end pr-2">
          {/* <EyeIcon
              size={16}
              className="cursor-pointer"
              onClick={() =>
                alert(`View flashcards in bundle: ${row.original.name}`)
              }
            /> */}
          <Edit2Icon
            size={16}
            className="cursor-pointer"
            onClick={() => {
              setActiveBundle(row.original);
              setEditOpen(true);
            }}
          />
          {deleteId === row.original.id ? (
            <Loader2 size={16} className="animate-spin text-red-600" />
          ) : (
            <Trash2
              size={16}
              className="cursor-pointer text-red-600"
              onClick={() => handleDelete(row.original.id)}
            />
          )}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: bundles,
    columns: bundleColumns,
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
          {loading ? (
            <TableRow>
              <TableCell colSpan={bundleColumns.length} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={bundleColumns.length} className="text-center">
                <NothingFound text="No bundles found!" />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <CreateBundle
        isEdit={true}
        bundle={activeBundle}
        trigger={false}
        open={editOpen}
        onOpenChange={setEditOpen}
        setBundles={setBundles}
      />
    </div>
  );
};

export default FCBundleTable;
