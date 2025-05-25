"use client";

import useCategoryStore, { Chapter, Subject, Topic } from "@/store/category";
import {
  CellContext,
  flexRender,
  getCoreRowModel,
  HeaderContext,
  useReactTable,
} from "@tanstack/react-table";
import React, { useEffect } from "react";
import { chapterColumn, subjectColumn, topicColumn } from "./columns";
import {
  Table as ShadTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { category } from "./Category";

const Table = ({ activeTab }: { activeTab: category }) => {
  const {
    subjects,
    chapters,
    topics,
    fetchSubjects,
    fetchChapters,
    fetchTopics,
  } = useCategoryStore();

  useEffect(() => {
    fetchSubjects();
    fetchChapters();
    fetchTopics();
  }, []);

  const subTable = useReactTable({
    data: subjects,
    columns: subjectColumn,
    getCoreRowModel: getCoreRowModel(),
  });

  const chapTable = useReactTable({
    data: chapters,
    columns: chapterColumn,
    getCoreRowModel: getCoreRowModel(),
  });

  const topTable = useReactTable({
    data: topics,
    columns: topicColumn,
    getCoreRowModel: getCoreRowModel(),
  });

  const table =
    activeTab == "subject"
      ? subTable
      : activeTab == "chapter"
        ? chapTable
        : topTable;

  return (
    <div className="rounded-md border">
      <ShadTable>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {/* {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )} */}
                    {header.isPlaceholder
                      ? null
                      : activeTab === "subject"
                        ? flexRender(
                            header.column.columnDef.header as
                              | React.ReactNode
                              | ((
                                  ctx: HeaderContext<Subject, unknown>,
                                ) => React.ReactNode),
                            header.getContext() as HeaderContext<
                              Subject,
                              unknown
                            >,
                          )
                        : activeTab === "chapter"
                          ? flexRender(
                              header.column.columnDef.header as
                                | React.ReactNode
                                | ((
                                    ctx: HeaderContext<Chapter, unknown>,
                                  ) => React.ReactNode),
                              header.getContext() as HeaderContext<
                                Chapter,
                                unknown
                              >,
                            )
                          : flexRender(
                              header.column.columnDef.header as
                                | React.ReactNode
                                | ((
                                    ctx: HeaderContext<Topic, unknown>,
                                  ) => React.ReactNode),
                              header.getContext() as HeaderContext<
                                Topic,
                                unknown
                              >,
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
                    {/* {flexRender(cell.column.columnDef.cell, cell.getContext())} */}
                    {activeTab === "subject"
                      ? flexRender(
                          cell.column.columnDef.cell as
                            | React.ReactNode
                            | ((
                                ctx: CellContext<Subject, unknown>,
                              ) => React.ReactNode),
                          cell.getContext() as CellContext<Subject, unknown>,
                        )
                      : activeTab === "chapter"
                        ? flexRender(
                            cell.column.columnDef.cell as
                              | React.ReactNode
                              | ((
                                  ctx: CellContext<Chapter, unknown>,
                                ) => React.ReactNode),
                            cell.getContext() as CellContext<Chapter, unknown>,
                          )
                        : flexRender(
                            cell.column.columnDef.cell as
                              | React.ReactNode
                              | ((
                                  ctx: CellContext<Topic, unknown>,
                                ) => React.ReactNode),
                            cell.getContext() as CellContext<Topic, unknown>,
                          )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={subjects.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </ShadTable>
    </div>
  );
};

export default Table;
