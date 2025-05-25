import { Chapter, Subject, Topic } from "@/store/category";
import { ColumnDef } from "@tanstack/react-table";

export const subjectColumn: ColumnDef<Subject>[] = [
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
    accessorKey: "year",
    header: "Year",
  },
  {
    accessorKey: "country",
    header: "Country",
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
];

export const chapterColumn: ColumnDef<Chapter>[] = [
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
];

export const topicColumn: ColumnDef<Topic>[] = [
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
    accessorKey: "_count.mindMaps",
    header: "Mind maps",
  },
  {
    accessorKey: "_count.question",
    header: "Questions",
  },
];
