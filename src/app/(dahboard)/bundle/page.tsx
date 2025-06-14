"use client";

import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import CreateBundle from "./_components/CreateBundle";
import FCBundleTable from "./_components/FcBundleTable";

const Page = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="px-2">
      <h1 className="capitalize text-3xl py-3 px-2 bg-gray-100 rounded-md mb-4">
        Flashcard Bundles
      </h1>

      <div className="flex gap-4 pb-4 items-center justify-end w-[400px] ml-auto">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <CreateBundle />
      </div>

      <FCBundleTable />
    </div>
  );
};

export default Page;
