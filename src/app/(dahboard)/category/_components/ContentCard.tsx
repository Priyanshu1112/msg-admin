import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import React from "react";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

interface ContentCardProps {
  index: number;
  title: string;
  name: string;
  onNameChange: (value: string) => void;
  description?: string;
  onDescriptionChange?: (value: string) => void;
  footer?: React.ReactNode;
}

export const ContentCard = ({
  index,
  title,
  name,
  onNameChange,
  description,
  onDescriptionChange,
  footer,
}: ContentCardProps) => {
  return (
    <Card className="border">
      <CardHeader className="flex flex-row items-start justify-between">
        <CardTitle className="text-lg">
          {title} {index + 1}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={`name-${index}`}>Name</Label>
          <Input
            id={`name-${index}`}
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter name"
            className="mt-1"
          />
        </div>

        {onDescriptionChange && (
          <div>
            <Label htmlFor={`description-${index}`}>Description</Label>
            <Textarea
              id={`description-${index}`}
              value={description}
              onChange={(e) => {
                onDescriptionChange(e.target.value);
              }}
              placeholder="Enter description"
              className="mt-1"
              rows={3}
            />
          </div>
        )}

        <div className="text-sm text-muted-foreground mt-2">{footer}</div>
      </CardContent>
    </Card>
  );
};
