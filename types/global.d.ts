interface ApiResponse<T> {
  success: boolean;
  data: T[];
}

interface MindMapNode {
  id: string;
  name: string;
  color: string;
  image?: string;
  table?: boolean;
  children?: MindMapNode[];
  _children?: MindMapNode[]; // For collapsed nodes
}

type category = "subject" | "topic" | "chapter";
