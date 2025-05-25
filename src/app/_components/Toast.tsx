"use client";

import useAppStore from "@/store/app";
import React, { useEffect } from "react";
import { toast } from "sonner";

const Toast = () => {
  const { error, success } = useAppStore();

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    if (success) toast.success(success);
  }, [success]);

  return <></>;
};

export default Toast;
