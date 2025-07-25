"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import StreamsCourses from "./StreamsCourses";
import AddCategory from "./forms/AddCategory";
import CategoryTable from "./tables/Table";


const Category = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");

  // Derive active tab from query param, default to 'subject'
  const param = searchParams.get("tab");
  const activeTab =
    param === "subject" || param === "chapter" ? (param as category) : "topic";

  const handleTabChange = (val: string) => {
    const tab = val as category;
    // Update URL with ?tab=value
    if (tab != "topic") router.push(`${pathname}?tab=${tab}`);
    else router.push(`${pathname}`);
  };

  return (
    <div className="overflow-hidden w-full overflow-y-auto h-screen px-2">
      <div className="sticky top-0 left-0 bg-white pb-4">
        <h1 className="capitalize text-3xl py-3 px-2 bg-gray-100 rounded-md mb-4">
          {activeTab}
        </h1>
        <div className="flex justify-between">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-[400px]"
          >
            <TabsList>
              <TabsTrigger className="cursor-pointer" value="topic">
                Topic
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="chapter">
                Chapter
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="subject">
                Subject
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-4 items-center">
            <StreamsCourses />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <AddCategory activeTab={activeTab} />
          </div>
        </div>
      </div>

      <CategoryTable activeTab={activeTab} />
    </div>
  );
};

export default Category;
