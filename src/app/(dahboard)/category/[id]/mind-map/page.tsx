"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Plus } from "lucide-react";

import Loader from "@/app/_components/Loader";
import NothingFound from "@/app/_components/NothingFound";
import MindMap from "./_component/MindMap";
import useContentStore from "@/store/content";
import useCategoryStore, { Topic } from "@/store/category";

export default function MindMapPage() {
  const { mindMaps, fetchMindMaps, loadingMindMaps } = useContentStore();
  const { topics } = useCategoryStore();

  const params = useParams();
  const router = useRouter();
  const topicId = params.id as string;

  useEffect(() => {
    if (topicId) fetchMindMaps(topicId);
  }, [topicId, fetchMindMaps]);

  const topicData: Topic | undefined = useMemo(() => {
    if (topicId) topics.find((t) => t.id == topicId);
  }, [topicId, topics]);

  const [selectedMindMapIndex, setSelectedMindMapIndex] = useState(0);

  //   useEffect(() => {
  //     const fetchTopicData = async () => {
  //       try {
  //         setLoading(true);
  //         const response = await fetch(`/api/topic/${topicId}/mind-maps`);

  //         if (!response.ok) {
  //           throw new Error("Failed to fetch topic data");
  //         }

  //         const data = await response.json();
  //         setTopicData(data.data);

  //         if (data.data?.mindMaps?.length === 0) {
  //           setError("No mind maps found for this topic");
  //         }
  //       } catch (err) {
  //         setError(err instanceof Error ? err.message : "An error occurred");
  //       } finally {
  //         setLoading(false);
  //       }
  //     };

  //     if (topicId) {
  //       fetchTopicData();
  //     }
  //   }, [topicId]);

  const handleBack = () => {
    router.push("/category?tab=topic");
  };

  const handleAddMindMap = () => {
    // This would open the add content dialog or navigate to upload page
    router.push(`/category?tab=topic`);
  };

  if (loadingMindMaps) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (mindMaps.length == 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <NothingFound text="Topic not found" />
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Topics
        </Button>
      </div>
    );
  }

  const currentMindMap = mindMaps[selectedMindMapIndex].mindMap;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {topicData?.name}
            </h1>
            <p className="text-sm text-gray-500">
              Chapter: {topicData?.chapter.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleAddMindMap}>
            <Plus className="mr-2 h-4 w-4" />
            Add Mind Map
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FileText className="h-4 w-4" />
            {topicData?._count.mindMaps} Mind Map(s)
          </div>
        </div>
      </div>

      {/* Mind Map Navigation */}
      {topicData?._count.mindMaps > 1 && (
        <div className="bg-white border-b px-6 py-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            {mindMaps.map((mindMap, index) => (
              <Button
                key={mindMap.id}
                variant={selectedMindMapIndex === index ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMindMapIndex(index)}
                className="whitespace-nowrap"
              >
                Mind Map {index + 1}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Mind Map Visualization */}
      <div className="flex-1 p-6">
        {currentMindMap && (
          <div className="h-full bg-white rounded-lg shadow-sm border">
            <MindMap initialData={currentMindMap} />
          </div>
        )}
      </div>
    </div>
  );
}
