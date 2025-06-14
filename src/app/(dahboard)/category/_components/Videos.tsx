import React, { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useContentStore from "@/store/content";
import Loader from "@/app/_components/Loader";
import { LoaderCircle, Trash2 } from "lucide-react";
import Image from "next/image";

const Videos = ({ topicId }: { topicId: string }) => {
  const { fetchVideos, videos, loadingVideo, deleteVideo } = useContentStore();
  const [deleteId, setDeleteId] = useState("");

  useEffect(() => {
    fetchVideos(topicId);
  }, [fetchVideos, topicId]);

  const handleDelete = async (id: string) => {
    setDeleteId(id);

    const confirm = window.confirm(
      "Are you sure you want to delete this video?"
    );

    if (confirm) await deleteVideo(id);

    setDeleteId("");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {loadingVideo ? (
        <div className="col-span-3 mt-4">
          <Loader size={16} />
        </div>
      ) : (
        videos.map((video) => (
          <Card key={video.id} className="flex flex-col">
            <CardContent className="p-0">
              <iframe
                className="rounded-t-md w-full aspect-video"
                src={video.url}
                allowFullScreen
              />
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2 px-4 py-3">
              <div className="text-base font-medium">{video.title}</div>
              {video.faculty && (
                <div className="flex items-center gap-3 w-full">
                  {video.faculty.imageUrl ? (
                    <Image
                      src={video.faculty.imageUrl}
                      alt={video.faculty.name}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted" />
                  )}
                  <div className="text-sm text-muted-foreground leading-tight">
                    <div className="font-medium">{video.faculty.name}</div>
                    <div className="text-xs">{video.faculty.qualification}</div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="ml-auto text-red-500 hover:text-red-700 disabled:opacity-50"
                    onClick={() => handleDelete(video.id)}
                    disabled={video.id == deleteId}
                  >
                    {video.id == deleteId ? (
                      <LoaderCircle size={16} className="rotate" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
};

export default Videos;
