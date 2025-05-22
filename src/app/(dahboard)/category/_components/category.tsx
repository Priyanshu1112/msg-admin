"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Table from "./Table";

export type category = "subject" | "topic" | "chapter";

const Category = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Derive active tab from query param, default to 'subject'
  const param = searchParams.get("tab");
  const activeTab =
    param === "topic" || param === "chapter" ? (param as category) : "subject";

  const handleTabChange = (val: string) => {
    const tab = val as category;
    // Update URL with ?tab=value
    if (tab != "subject") router.push(`${pathname}?tab=${tab}`);
    else router.push(`${pathname}`);
  };

  return (
    <div className="overflow-hidden w-full overflow-y-auto h-screen">
      <div className="sticky top-0 left-0 bg-white pb-4">
        <h1 className="capitalize text-3xl py-3 px-2 bg-gray-100 rounded-md mb-4">
          {activeTab}
        </h1>
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-[400px]"
        >
          <TabsList>
            <TabsTrigger className="cursor-pointer" value="subject">
              Subject
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="chapter">
              Chapter
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="topic">
              Topic
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Table />
    </div>
  );
};

export default Category;
