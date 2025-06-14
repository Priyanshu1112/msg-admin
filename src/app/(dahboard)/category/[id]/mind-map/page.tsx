"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Edit3, Check, X } from "lucide-react";

import Loader from "@/app/_components/Loader";
import NothingFound from "@/app/_components/NothingFound";
import MindMap from "./_component/MindMap";
import useContentStore from "@/store/content";
import useCategoryStore, { Topic } from "@/store/category";
import { ExtendedMindMapNode } from "./_component/MindMap";

export default function MindMapPage() {
  const {
    mindMaps,
    fetchMindMaps,
    loadingMindMaps,
    updateMindMap,
    updatingMindMaps,
  } = useContentStore();
  const { topics } = useCategoryStore();

  const params = useParams();
  const router = useRouter();
  const topicId = params.id as string;

  const searchParams = useSearchParams();
  const mindMapId = searchParams.get("id");

  // State to track mind map changes
  const [mindMapData, setMindMapData] = useState<ExtendedMindMapNode | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Editable fields state
  const [editableName, setEditableName] = useState("");
  const [editableDescription, setEditableDescription] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [originalDescription, setOriginalDescription] = useState("");

  // Edit mode states
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  useEffect(() => {
    if (topicId) fetchMindMaps(topicId);
  }, [topicId, fetchMindMaps]);

  const topicData: Topic | undefined = useMemo(() => {
    if (topicId) return topics.find((t) => t.id == topicId);
    return undefined;
  }, [topicId, topics]);

  const mindMap = useMemo(() => {
    if (mindMapId === null) return undefined;
    return mindMaps.find((m) => m.id == mindMapId);
  }, [mindMaps, mindMapId]);

  // Initialize mind map data when mindMap changes
  useEffect(() => {
    if (mindMap) {
      // Handle mind map data
      let initialData: ExtendedMindMapNode;

      if (typeof mindMap.mindMap === "string") {
        try {
          initialData = JSON.parse(mindMap.mindMap);
        } catch (error) {
          console.error("Error parsing mind map data:", error);
          return;
        }
      } else if (typeof mindMap.mindMap === "object" && mindMap.mindMap !== null) {
        initialData = mindMap.mindMap as ExtendedMindMapNode;
      } else {
        console.error("Invalid mind map data type:", typeof mindMap.mindMap);
        return;
      }

      setMindMapData(initialData);

      // Initialize editable fields
      setEditableName(mindMap.name || "");
      setEditableDescription(mindMap.description || "");
      setOriginalName(mindMap.name || "");
      setOriginalDescription(mindMap.description || "");
      
      setHasChanges(false);
    }
  }, [mindMap]);

  // Check if there are any changes
  const checkForChanges = () => {
    const nameChanged = editableName !== originalName;
    const descriptionChanged = editableDescription !== originalDescription;
    const mindMapChanged = hasChanges; // This is set by mind map component
    
    return nameChanged || descriptionChanged || mindMapChanged;
  };

  // Update hasChanges when any field changes
  useEffect(() => {
    const hasAnyChanges = checkForChanges();
    if (hasAnyChanges !== hasChanges) {
      setHasChanges(hasAnyChanges);
    }
  }, [editableName, editableDescription, originalName, originalDescription]);

  const handleBack = () => {
    router.push("/category");
  };

  // Handle mind map data changes
  const handleDataChange = (newData: ExtendedMindMapNode) => {
    setMindMapData(newData);
    setHasChanges(true);
  };

  // Handle name editing
  const startEditingName = () => {
    setIsEditingName(true);
  };

  const cancelNameEdit = () => {
    setEditableName(originalName);
    setIsEditingName(false);
  };

  const saveNameEdit = () => {
    setIsEditingName(false);
    // The change detection will automatically update hasChanges
  };

  // Handle description editing
  const startEditingDescription = () => {
    setIsEditingDescription(true);
  };

  const cancelDescriptionEdit = () => {
    setEditableDescription(originalDescription);
    setIsEditingDescription(false);
  };

  const saveDescriptionEdit = () => {
    setIsEditingDescription(false);
    // The change detection will automatically update hasChanges
  };

  // Handle save functionality
  const handleSave = async () => {
    if (mindMap && (mindMapData || editableName !== originalName || editableDescription !== originalDescription)) {
      try {
        await updateMindMap({
          mindMapId: mindMap.id,
          mindMap: mindMapData,
          name: editableName,
          description: editableDescription,
        });

        // Update original values after successful save
        setOriginalName(editableName);
        setOriginalDescription(editableDescription);
        setHasChanges(false);

        console.log("Mind map saved successfully!");
      } catch (error) {
        console.error("Error saving mind map:", error);
      }
    }
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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button
              onClick={handleSave}
              className={`${
                hasChanges
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-500"
              } transition-colors`}
              disabled={!hasChanges || updatingMindMaps}
            >
              <Save className="mr-2 h-4 w-4" />
              {updatingMindMaps
                ? "Saving..."
                : hasChanges
                ? "Save Changes"
                : "Saved"}
            </Button>
          </div>

          <div className="flex-1">
            {/* Editable Title */}
            <div className="flex items-center gap-2 mb-1">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editableName}
                    onChange={(e) => setEditableName(e.target.value)}
                    className="text-xl font-semibold text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveNameEdit();
                      if (e.key === "Escape") cancelNameEdit();
                    }}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={saveNameEdit}
                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={cancelNameEdit}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h1 className="text-xl font-semibold text-gray-900">
                    {editableName}
                    {(editableName !== originalName) && (
                      <span className="text-orange-500 ml-2">•</span>
                    )}
                  </h1>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={startEditingName}
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-500">Topic: {topicData?.name}</p>
          </div>
        </div>

        {/* Editable Description */}
        <div className="max-w-xl">
          {isEditingDescription ? (
            <div className="flex items-start gap-2">
              <textarea
                value={editableDescription}
                onChange={(e) => setEditableDescription(e.target.value)}
                className="text-sm text-gray-500 bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) saveDescriptionEdit();
                  if (e.key === "Escape") cancelDescriptionEdit();
                }}
              />
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={saveDescriptionEdit}
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={cancelDescriptionEdit}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-right group">
              <div className="flex items-start gap-2 justify-end">
                <div className="text-sm text-gray-500">
                  {editableDescription || "Click to add description"}
                  {(editableDescription !== originalDescription) && (
                    <span className="text-orange-500 ml-2">•</span>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={startEditingDescription}
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mind Map Visualization */}
      <div className="flex-1 p-6">
        {mindMap && mindMapData && (
          <div className="h-full bg-white rounded-lg shadow-sm border">
            <MindMap initialData={mindMapData} onChange={handleDataChange} />
          </div>
        )}
      </div>
    </div>
  );
}