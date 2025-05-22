"use client";

import useAppStore from "@/store/app";
import React, { useEffect } from "react";
import { toast } from "sonner";

const Toast = () => {
  const { error } = useAppStore();

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return <></>;
};

export default Toast;
