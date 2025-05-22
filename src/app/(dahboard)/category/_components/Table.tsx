"use client";

import useCategoryStore from "@/store/category";
import React, { useEffect } from "react";

const Table = () => {
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

  return <div></div>;
};

export default Table;
