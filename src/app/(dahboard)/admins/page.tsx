"use client";

import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import AdminTable from "./_components/AdminTable";
import CreateAdmin from "./_components/CreateAdmin";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

const Page = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="px-2">
      <h1 className="capitalize text-3xl py-3 px-2 bg-gray-100 rounded-md mb-4">
        Admins
      </h1>

      <div className="flex gap-4 pb-4 items-center justify-end w-[400px] ml-auto">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <CreateAdmin>
          <Button size="icon" variant="outline" className="cursor-pointer">
            <PlusIcon size={16} />
          </Button>
        </CreateAdmin>
      </div>

      <AdminTable />
    </div>
  );
};

export default Page;
