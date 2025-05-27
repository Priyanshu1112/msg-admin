import useCategoryStore, { Subject } from "@/store/category";
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
import { countries } from "@/contants/countries";
import { Edit2Icon, LoaderCircle, PlusIcon, Trash2 } from "lucide-react";
import AddCategory from "../forms/AddCategory";
import ToolTip from "@/app/_components/ToolTip";
import { DeleteCategoryDialog } from "../DeleteDialog";

const SubjectTable = () => {
  const { subjects, fetchSubjects, setActiveSubjectId, deleteSubject } =
    useCategoryStore();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const [deleteId, setDeleteId] = useState("");

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    await deleteSubject(id);
    setOpen(false);
    setDeleteId("");
  };

  const subjectColumn: ColumnDef<Subject>[] = [
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
      accessorKey: "stream.name",
      header: "Stream",
    },
    {
      accessorKey: "course.name",
      header: "Course",
      cell: ({ row }) => {
        return row.original?.course?.name ?? "N/A";
      },
    },
    {
      accessorKey: "year",
      header: "Year",
      cell: ({ row }) => {
        const years: number[] = row.original.year;
        const ordinals = years.map(getOrdinal);

        if (ordinals.length === 1) return ordinals[0];
        if (ordinals.length === 2) return `${ordinals[0]} and ${ordinals[1]}`;

        const last = ordinals.pop();
        return `${ordinals.join(", ")} and ${last}`;
      },
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: ({ row }) => {
        return getCountry(row.original.country)?.label;
      },
    },
    {
      accessorKey: "_count.chapters",
      header: "Chapters",
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
            <ToolTip content="Add chapter">
              <PlusIcon
                size={16}
                className="cursor-pointer"
                onClick={() => {
                  setActiveSubjectId(row.original.id);
                  setOpen(true);
                }}
              />
            </ToolTip>
            <ToolTip content="Edit">
              <Edit2Icon
                size={16}
                className="cursor-pointer"
                onClick={() => {
                  setActiveSubjectId(row.original.id);
                  setEdit(true);
                }}
              />
            </ToolTip>
            {deleteId == row.original.id ? (
              <LoaderCircle size={16} className="rotate" />
            ) : (
              <DeleteCategoryDialog
                category="subject"
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

  const getCountry = (countryCode: string) => {
    for (const entry of countries) {
      const [code, data] = Object.entries(entry)[0];
      if (code === countryCode) {
        return { value: code, label: data.country };
      }
    }
    return { value: "N/A", label: "N/A" };
  };

  const getOrdinal = (n: number) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  };

  const table = useReactTable({
    data: subjects,
    columns: subjectColumn,
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
                colSpan={subjectColumn.length}
                className="h-24 text-center"
              >
                <NothingFound text="No subjects found!" />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {open && (
        <AddCategory
          activeTab="chapter"
          trigger={false}
          open={open}
          onOpenChange={setOpen}
        />
      )}
      {edit && (
        <AddCategory
          activeTab="subject"
          trigger={false}
          open={edit}
          onOpenChange={setEdit}
          edit={true}
        />
      )}
    </div>
  );
};

export default SubjectTable;
