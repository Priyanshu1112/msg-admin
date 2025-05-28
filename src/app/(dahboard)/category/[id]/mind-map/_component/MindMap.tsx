/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { JSX, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import dagre from "dagre";
import {
  COLOR_PALETTE,
  COLOR_SYSTEM,
  ICON_PATHS,
} from "@/app/(dahboard)/_parser/constants";
import { ColorPicker } from "./ColorPicker";

// Node Edit Modal imports
interface NodeEditData {
  id: string;
  name: string;
  image?: string;
}

export interface ExtendedMindMapNode {
  id: string;
  name: string;
  color: string;
  table: boolean;
  children: ExtendedMindMapNode[];
  _children?: ExtendedMindMapNode[];
  side?: "left" | "right";
  collapsed?: boolean;
  isNew?: boolean; // Flag for animation
  isDeleting?: boolean; // Flag for deletion animation
  image?: string; // Add image property
}

interface NodeDimensions {
  width: number;
  height: number;
}

interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  node: any; // Store the original node
}

// Our custom interface to extend Dagre's node type
interface CustomNodeObject {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  label?: string;
  color?: string;
  depth?: number;
  table?: boolean;
  side?: "left" | "right";
  // Add a property to store the original node
  originalNode?: any;
}

// Node Edit Modal Component
const NodeEditModal = ({
  nodeEditData,
  mindMapData,
  findNodeById,
  setNodeEditData,
  saveNodeEdit,
  extractedText,
  setExtractedText,
  isExtracting,
  extractTextFromImage,
  useExtractedText,
  fileInputRef,
}: {
  nodeEditData: NodeEditData;
  mindMapData: ExtendedMindMapNode | null;
  findNodeById: (
    node: ExtendedMindMapNode | null,
    id: string
  ) => ExtendedMindMapNode | null;
  setNodeEditData: (data: NodeEditData | null) => void;
  saveNodeEdit: () => void;
  extractedText: string;
  setExtractedText: (text: string) => void;
  isExtracting: boolean;
  extractTextFromImage: () => Promise<void>;
  useExtractedText: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}) => {
  const node = findNodeById(mindMapData, nodeEditData.id);
  if (!node) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-lg z-20 w-96">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">Edit Node</h3>
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={() => {
            setNodeEditData(null);
            setExtractedText("");
          }}
        >
          ×
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Node Text
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          value={nodeEditData.name}
          onChange={(e) =>
            setNodeEditData({ ...nodeEditData, name: e.target.value })
          }
          placeholder="Node text"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Image
        </label>
        <div className="flex">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose File
          </button>
          {nodeEditData.image && (
            <button
              className="ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() => setNodeEditData({ ...nodeEditData, image: "" })}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {nodeEditData.image && (
        <>
          <div className="mb-4 flex justify-center">
            <div className="border rounded p-2 w-64 h-64 flex items-center justify-center">
              <img
                src={nodeEditData.image}
                alt="Preview"
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' text-anchor='middle' alignment-baseline='middle' fill='%23999'%3EImage Error%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
          </div>

          <div className="mb-4">
            <button
              className={`w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                isExtracting ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={extractTextFromImage}
              disabled={isExtracting}
            >
              {isExtracting ? "Extracting Text..." : "Extract Text from Image"}
            </button>
          </div>

          {extractedText && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Extracted Text
              </label>
              <div className="p-2 bg-gray-100 border rounded mb-2 max-h-32 overflow-y-auto">
                {extractedText}
              </div>
              <button
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                onClick={useExtractedText}
              >
                Use as Node Text
              </button>
            </div>
          )}
        </>
      )}

      <div className="flex justify-end space-x-2">
        <button
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => {
            setNodeEditData(null);
            setExtractedText("");
          }}
        >
          Cancel
        </button>
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => {
            saveNodeEdit();
            setExtractedText("");
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default function MindMap({
  initialData,
  onNodeAdd,
  onNodeEdit,
  onNodeDelete,
}: {
  initialData: ExtendedMindMapNode;
  onNodeAdd?: (parentId: string) => void;
  onNodeEdit?: (nodeId: string) => void;
  onNodeDelete?: (nodeId: string) => void;
}): JSX.Element {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<ExtendedMindMapNode>(initialData);
  const [colorPickerNode, setColorPickerNode] = useState<string | null>(null);

  // Node edit states
  const [nodeEditData, setNodeEditData] = useState<NodeEditData | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  // Function to find a node by id
  const findNodeById = (
    node: ExtendedMindMapNode | null,
    id: string
  ): ExtendedMindMapNode | null => {
    if (!node) return null;
    if (node.id === id) return node;

    if (node.children) {
      for (const child of node.children) {
        const found = findNodeById(child, id);
        if (found) return found;
      }
    }

    // Also check in _children (collapsed nodes)
    if (node._children) {
      for (const child of node._children) {
        const found = findNodeById(child, id);
        if (found) return found;
      }
    }

    return null;
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && nodeEditData) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setNodeEditData({
          ...nodeEditData,
          image: result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Extract text from image (simulated)
  const extractTextFromImage = async () => {
    if (!nodeEditData?.image) return;

    setIsExtracting(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulated extracted text - in a real application,
    // you would call an OCR service here
    setExtractedText(
      "Sample extracted text from image. This is where your OCR API would return the actual text from the image."
    );

    setIsExtracting(false);
  };

  // Use extracted text as node text
  const useExtractedText = () => {
    if (extractedText && nodeEditData) {
      setNodeEditData({
        ...nodeEditData,
        name: extractedText,
      });
    }
  };

  // Save node edit
  const saveNodeEdit = () => {
    if (!nodeEditData) return;

    const newData = JSON.parse(JSON.stringify(data));

    const updateNode = (node: ExtendedMindMapNode): boolean => {
      if (node.id === nodeEditData.id) {
        node.name = nodeEditData.name;
        node.image = nodeEditData.image;
        return true;
      }

      if (node.children) {
        for (const child of node.children) {
          if (updateNode(child)) return true;
        }
      }

      if (node._children) {
        for (const child of node._children) {
          if (updateNode(child)) return true;
        }
      }

      return false;
    };

    updateNode(newData);
    setData(newData);
    setNodeEditData(null);
  };

  // Function to change a node's color and propagate to all children
  const changeNodeColor = (nodeId: string, color: string) => {
    // Create a deep copy of the data to modify
    const newData = JSON.parse(JSON.stringify(data));

    // Helper function to recursively update colors
    const updateNodeColor = (node: ExtendedMindMapNode): boolean => {
      if (node.id === nodeId) {
        // Update this node's color - just the base color property
        // The actual display color will be determined by getColor() based on depth
        node.color = color;

        // Recursively update all children's base color property
        const updateChildrenColors = (children: ExtendedMindMapNode[]) => {
          for (const child of children) {
            child.color = color; // Set the base color
            if (child.children) updateChildrenColors(child.children);
            if (child._children) updateChildrenColors(child._children);
          }
        };

        if (node.children) updateChildrenColors(node.children);
        if (node._children) updateChildrenColors(node._children);

        return true;
      }

      // Search in children
      if (node.children) {
        for (const child of node.children) {
          if (updateNodeColor(child)) return true;
        }
      }

      // Search in _children (collapsed nodes)
      if (node._children) {
        for (const child of node._children) {
          if (updateNodeColor(child)) return true;
        }
      }

      return false;
    };

    updateNodeColor(newData);
    setData(newData);
    setColorPickerNode(null); // Close the color picker after selection
  };

  // Function to toggle node collapse/expand
  const toggleNodeCollapse = (nodeId: string) => {
    // Create a deep copy of the data to modify
    const newData = JSON.parse(JSON.stringify(data));

    // Helper function to find and toggle a node
    const toggleNode = (node: ExtendedMindMapNode): boolean => {
      if (node.id === nodeId) {
        // If node is already collapsed, expand it
        if (node.collapsed) {
          node.collapsed = false;
          if (node._children && node._children.length > 0) {
            // Mark children as new for animation
            node._children.forEach((child) => {
              child.isNew = true;
            });
            node.children = node._children;
            node._children = [];
          }
        }
        // Otherwise, collapse it
        else {
          if (node.children && node.children.length > 0) {
            node.collapsed = true;
            node._children = node.children;
            node.children = [];
          }
        }
        return true;
      }

      // Recursively search through children
      if (node.children) {
        for (const child of node.children) {
          if (toggleNode(child)) {
            return true;
          }
        }
      }

      return false;
    };

    toggleNode(newData);
    setData(newData);
  };

  // Function to handle adding a new node with animation
  const handleAddNode = (parentId: string) => {
    if (onNodeAdd) {
      onNodeAdd(parentId);
    } else {
      // Default implementation if no handler provided
      const newData = JSON.parse(JSON.stringify(data));

      // Helper function to find the parent node and add a child
      const addChildToNode = (node: ExtendedMindMapNode): boolean => {
        if (node.id === parentId) {
          // Add a new default node with animation flag
          const newNodeId = `node-${Date.now()}`;
          const newNode: ExtendedMindMapNode = {
            id: newNodeId,
            name: "New node",
            color: node.color,
            table: false,
            children: [],
            side: node.side,
            isNew: true, // Flag for animation
          };

          // If node was collapsed, expand it
          if (node.collapsed) {
            node.collapsed = false;
            if (node._children) {
              node.children = [...node._children, newNode];
              node._children = [];
            } else {
              node.children = [newNode];
            }
          } else {
            node.children = [...(node.children || []), newNode];
          }

          return true;
        }

        // Recursively search through children
        if (node.children) {
          for (const child of node.children) {
            if (addChildToNode(child)) {
              return true;
            }
          }
        }

        return false;
      };

      addChildToNode(newData);
      setData(newData);

      // After a delay, remove the isNew flag (it's only needed for the animation)
      setTimeout(() => {
        const updatedData = JSON.parse(JSON.stringify(newData));
        const clearNewFlag = (node: ExtendedMindMapNode) => {
          node.isNew = false;
          if (node.children) {
            node.children.forEach(clearNewFlag);
          }
          if (node._children) {
            node._children.forEach(clearNewFlag);
          }
        };
        clearNewFlag(updatedData);
        setData(updatedData);
      }, 1000); // After animation completes
    }
  };

  // Function to handle editing a node
  const handleEditNode = (nodeId: string) => {
    if (onNodeEdit) {
      onNodeEdit(nodeId);
    } else {
      // Default implementation
      const node = findNodeById(data, nodeId);
      if (node) {
        setNodeEditData({
          id: node.id,
          name: node.name,
          image: node.image,
        });
      }
    }
  };

  // Function to handle deleting a node with animation
  const handleDeleteNode = (nodeId: string) => {
    if (onNodeDelete) {
      onNodeDelete(nodeId);
    } else {
      // Default implementation if no handler provided
      const newData = JSON.parse(JSON.stringify(data));

      // First, mark the node for deletion (for animation)
      const markForDeletion = (node: ExtendedMindMapNode): boolean => {
        if (node.children) {
          for (let i = 0; i < node.children.length; i++) {
            if (node.children[i].id === nodeId) {
              node.children[i].isDeleting = true;
              return true;
            }

            if (markForDeletion(node.children[i])) {
              return true;
            }
          }
        }
        return false;
      };

      // Don't allow deleting the root node
      if (nodeId !== newData.id) {
        markForDeletion(newData);
        setData(newData);

        // After animation completes, actually remove the node
        setTimeout(() => {
          const finalData = JSON.parse(JSON.stringify(newData));

          // Helper function to find and remove the node
          const removeNode = (parent: ExtendedMindMapNode): boolean => {
            if (parent.children) {
              const index = parent.children.findIndex(
                (child) => child.id === nodeId
              );
              if (index !== -1) {
                parent.children.splice(index, 1);
                return true;
              }

              // If not found directly, search in children recursively
              for (const child of parent.children) {
                if (removeNode(child)) {
                  return true;
                }
              }
            }
            return false;
          };

          removeNode(finalData);
          setData(finalData);
        }, 500); // After fade-out animation completes
      }
    }
  };

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return;

    // --- Clear & measure ---
    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll("*").remove();

    const containerW = containerRef.current.clientWidth || 1200;
    const containerH = containerRef.current.clientHeight || 800;

    // Make SVG big enough for full layout but don't make it excessively large
    const width = Math.max(1500, containerW * 1.5);
    const height = Math.max(1000, containerH * 1.5);

    // --- Measure text for sizing nodes ---
    const textMeasurer = svgEl.append("g").style("visibility", "hidden");
    const calculateNodeSize = (node: any): NodeDimensions => {
      const minW = 160;
      const minH = 40;
      const [padY, padX] = [12, 14];

      let rawW, rawH;

      // Different measurement approach based on whether we have an image
      const tempText = textMeasurer
        .append("text")
        .text(node.depth == 0 ? node.name.toUpperCase() : node.name)
        .style("font-size", node.depth === 0 ? "20px" : "18px")
        .style("font-weight", node.depth <= 1 ? "bold" : "normal");
      if (!node.image) {
        // Text-only measurement

        rawW = (tempText.node() as SVGTextElement).getComputedTextLength();
        rawH = (tempText.node() as SVGTextElement).getBBox().height;
        tempText.remove();
      } else {
        // Image + text measurement - use a fixed size approach
        // since foreignObject measurement is unreliable
        rawW = (tempText.node() as SVGTextElement).getComputedTextLength();
        rawH = 80; // Fixed basic height for image nodes
      }

      // Base dimensions including padding
      const width = Math.max(minW, rawW + padX * 2);
      let height = Math.max(minH, rawH + padY * 2);

      // If it's a table, ensure enough room for rows
      if (node.table && node.children?.length) {
        const rowHeight = 20; // Approximate row height
        const totalRows = node.children.length + 1; // +1 for header
        height = Math.max(height, rowHeight * totalRows + padY * 2);
      }

      // If node has an image, make it taller
      if (node.image) {
        // For image nodes, use a more generous size
        height += 150; // Ensure enough height for image + text
      }

      return { width, height };
    };

    // Clone & enhance data with depth and dimensions
    const processed = JSON.parse(JSON.stringify(data)) as any;

    // Function to enhance node with depth and dimensions
    const enhance = (node: any, depth = 0) => {
      node.depth = depth;
      const { width, height } = calculateNodeSize(node);
      node.width = width;
      node.height = height;

      if (node.children) {
        node.children.forEach((child: any) => enhance(child, depth + 1));
      }
    };

    // Assign sides if not already set
    const assignSides = (node: any) => {
      if (node.depth === 0 && node.children) {
        // Count already assigned
        const unassigned = node.children.filter((c: any) => !c.side);

        // Assign sides to balance the tree
        const halfIndex = Math.ceil(unassigned.length / 2);
        unassigned.forEach((child: any, index: number) => {
          child.side = index < halfIndex ? "left" : "right";
        });
      }

      // Process children recursively, inheriting parent's side
      if (node.children) {
        node.children.forEach((child: any) => {
          if (node.depth > 0 && !child.side) {
            child.side = node.side; // Inherit parent's side
          }
          assignSides(child);
        });
      }
    };

    // Process the data
    assignSides(processed);
    enhance(processed);
    textMeasurer.remove();

    // --- Create separate graphs for left and right sides ---
    const leftNodes: { node: any; parent: any }[] = [];
    const rightNodes: { node: any; parent: any }[] = [];
    const rootNode = processed;

    // Divide nodes into left and right
    const separateNodes = (node: any, parent?: any) => {
      if (node.depth === 0) {
        // Root node - process children
        if (node.children) {
          node.children.forEach((child: any) => separateNodes(child, node));
        }
      } else {
        // Add to the appropriate side array
        if (node.side === "left") {
          leftNodes.push({ node, parent });
        } else {
          rightNodes.push({ node, parent });
        }

        // Process children
        if (node.children) {
          node.children.forEach((child: any) => separateNodes(child, node));
        }
      }
    };

    separateNodes(rootNode);

    // --- Create Dagre graphs ---
    const gRight = new dagre.graphlib.Graph();
    const gLeft = new dagre.graphlib.Graph();

    gRight.setGraph({
      rankdir: "LR",
      nodesep: 20,
      ranksep: 10,
      marginx: 5,
      marginy: 5,
      acyclicer: "greedy",
    });

    gLeft.setGraph({
      rankdir: "RL",
      nodesep: 20,
      ranksep: 10,
      marginx: 5,
      marginy: 5,
      acyclicer: "greedy",
    });

    gRight.setDefaultEdgeLabel(() => ({}));
    gLeft.setDefaultEdgeLabel(() => ({}));

    // Add root node to both graphs to anchor them
    const rootId = rootNode.id;
    const rootWidth = rootNode.width;
    const rootHeight = rootNode.height;

    // Create a mapping from id to original node to avoid TypeScript errors
    const nodeMap = new Map<string, any>();
    nodeMap.set(rootId, rootNode);

    // Add root to both graphs
    gRight.setNode(rootId, {
      label: rootNode.name,
      width: rootWidth,
      height: rootHeight,
      color: rootNode.color,
      depth: 0,
      originalNode: rootNode,
    } as CustomNodeObject);

    gLeft.setNode(rootId, {
      label: rootNode.name,
      width: rootWidth,
      height: rootHeight,
      color: rootNode.color,
      depth: 0,
      originalNode: rootNode,
    } as CustomNodeObject);

    // Add nodes to their respective graphs
    rightNodes.forEach(({ node, parent }) => {
      nodeMap.set(node.id, node);

      gRight.setNode(node.id, {
        label: node.name,
        width: node.width,
        height: node.height,
        color: node.color,
        depth: node.depth,
        table: node.table,
        originalNode: node,
      } as CustomNodeObject);

      // Add edge to parent
      const parentId = parent ? parent.id : rootId;
      gRight.setEdge(parentId, node.id);
    });

    leftNodes.forEach(({ node, parent }) => {
      nodeMap.set(node.id, node);

      gLeft.setNode(node.id, {
        label: node.name,
        width: node.width,
        height: node.height,
        color: node.color,
        depth: node.depth,
        table: node.table,
        originalNode: node,
      } as CustomNodeObject);

      // Add edge to parent
      const parentId = parent ? parent.id : rootId;
      gLeft.setEdge(parentId, node.id);
    });

    // Perform layout
    dagre.layout(gRight);
    dagre.layout(gLeft);

    // --- Create SVG elements ---
    svgEl
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("overflow", "visible");

    // Main container group - don't pre-translate it
    const svgG = svgEl.append("g").attr("class", "mindmap-container");

    // --- Position nodes ---
    // Set root node position at exact center of the container
    const centerX = containerW / 2;
    const centerY = containerH / 2;

    // Store all node positions
    const nodePositions: Record<string, NodePosition> = {};

    // Position root node at exact center
    nodePositions[rootId] = {
      x: centerX,
      y: centerY,
      width: rootWidth,
      height: rootHeight,
      node: rootNode,
    };

    // Get relative positions from Dagre
    const rightPositions = new Map<string, { x: number; y: number }>();
    const leftPositions = new Map<string, { x: number; y: number }>();

    // Collect relative positions from right graph
    gRight.nodes().forEach((id: string) => {
      if (id === rootId) return;
      const nodeInfo = gRight.node(id) as CustomNodeObject;
      if (!nodeInfo) return;
      rightPositions.set(id, { x: nodeInfo.x || 0, y: nodeInfo.y || 0 });
    });

    // Collect relative positions from left graph
    gLeft.nodes().forEach((id: string) => {
      if (id === rootId) return;
      const nodeInfo = gLeft.node(id) as CustomNodeObject;
      if (!nodeInfo) return;
      leftPositions.set(id, { x: nodeInfo.x || 0, y: nodeInfo.y || 0 });
    });

    // Get the root position in each graph
    const rightRootPos = gRight.node(rootId) as CustomNodeObject;
    const leftRootPos = gLeft.node(rootId) as CustomNodeObject;

    // Position right side nodes
    rightNodes.forEach(({ node }) => {
      const id = node.id;
      const pos = rightPositions.get(id);
      const originalNode = nodeMap.get(id);

      if (!pos || !originalNode || !rightRootPos) return;

      // Calculate offset from root in the Dagre layout
      const offsetX = (pos.x - (rightRootPos.x || 0)) * 1.0;
      const offsetY = pos.y - (rightRootPos.y || 0);

      // Position relative to center point
      nodePositions[id] = {
        x: centerX + offsetX,
        y: centerY + offsetY,
        width: node.width || 0,
        height: node.height || 0,
        node: originalNode,
      };
    });

    // Position left side nodes
    leftNodes.forEach(({ node }) => {
      const id = node.id;
      const pos = leftPositions.get(id);
      const originalNode = nodeMap.get(id);

      if (!pos || !originalNode || !leftRootPos) return;

      // Calculate offset from root in the Dagre layout
      const offsetX = (pos.x - (leftRootPos.x || 0)) * 1.0;
      const offsetY = pos.y - (leftRootPos.y || 0);

      // Position relative to center point
      nodePositions[id] = {
        x: centerX + offsetX,
        y: centerY + offsetY,
        width: node.width || 0,
        height: node.height || 0,
        node: originalNode,
      };
    });

    // --- Draw links ---
    const edgeG = svgG.append("g").attr("class", "edges");

    // Helper to find parent
    const findParent = (childId: string): string | null => {
      const child = nodeMap.get(childId);
      if (!child) return null;

      // Check if it's a direct child of root
      if (
        rootNode.children &&
        rootNode.children.some((c: any) => c.id === childId)
      ) {
        return rootId;
      }

      // Otherwise, find parent
      for (const [id, node] of nodeMap.entries()) {
        if (node.children && node.children.some((c: any) => c.id === childId)) {
          return id;
        }
      }

      return null;
    };

    // Draw all links
    Object.keys(nodePositions).forEach((id) => {
      if (id === rootId) return; // Skip root

      const targetPos = nodePositions[id];
      const parentId = findParent(id);

      if (parentId && nodePositions[parentId]) {
        const sourcePos = nodePositions[parentId];

        const path = d3.path();

        // Create curve
        const dx = targetPos.x - sourcePos.x;
        const midX = sourcePos.x + dx / 4;

        const moveToX =
          sourcePos.x +
          (sourcePos.node.id == "root" ? sourcePos.width / 2 : 0) +
          (sourcePos.node.side == "right"
            ? sourcePos.width / 2
            : -sourcePos.width / 2);
        const moveToY = sourcePos.y;

        path.moveTo(moveToX, moveToY);
        path.bezierCurveTo(
          midX,
          sourcePos.y,
          midX,
          targetPos.y,
          targetPos.x +
            (targetPos.node.side == "right"
              ? -targetPos.width / 2
              : targetPos.width / 2),
          targetPos.y
        );

        const depth = sourcePos.node.depth;
        const isNew = targetPos.node.isNew;
        const isDeleting = targetPos.node.isDeleting;

        // Use the target node's border color for the edge
        const edgeColor = COLOR_SYSTEM[targetPos.node.color].l1Border;
        // const edgeColor = getBorder(targetPos.node.color, targetPos.node.depth);

        const edge = edgeG
          .append("path")
          .attr("d", path.toString())
          .attr("fill", "none")
          .attr("stroke", edgeColor) // Use the node's border color for the edge
          .attr(
            "stroke-width",
            depth == 0 ? 3 : depth == 1 ? 2.5 : depth == 2 ? 1.5 : 1
          );

        // Apply animation for new links
        if (isNew) {
          edge
            .style("opacity", 0)
            .transition()
            .duration(500)
            .style("opacity", 1);
        }

        // Apply animation for deleting links
        if (isDeleting) {
          edge.transition().duration(500).style("opacity", 0);
        }
      }
    });

    // --- Draw nodes ---
    const nodeG = svgG.append("g").attr("class", "nodes");

    Object.entries(nodePositions).forEach(([id, pos]) => {
      const node = pos.node;
      const hasChildren = node.children && node.children.length > 0;
      const isCollapsed = node.collapsed || false;
      const hasHiddenChildren =
        isCollapsed || (node._children && node._children.length > 0);
      const isRootNode = id === rootId;
      const isFirstChild = pos.node.depth == 1;
      const isNew = node.isNew;
      const isDeleting = node.isDeleting;

      // Create node group
      const nodeGroup = nodeG
        .append("g")
        .attr(
          "transform",
          `translate(${pos.x - pos.width / 2},${pos.y - pos.height / 2})`
        )
        .attr("class", "node-group")
        .style("cursor", "pointer");

      // Apply animation for new nodes
      if (isNew) {
        nodeGroup
          .style("opacity", 0)
          .attr(
            "transform",
            `translate(${pos.x - pos.width / 2},${
              pos.y - pos.height / 2
            }) scale(0.5)`
          )
          .transition()
          .duration(500)
          .style("opacity", 1)
          .attr(
            "transform",
            `translate(${pos.x - pos.width / 2},${
              pos.y - pos.height / 2
            }) scale(1)`
          );
      }

      // Apply animation for deleting nodes
      if (isDeleting) {
        nodeGroup
          .transition()
          .duration(500)
          .style("opacity", 0)
          .attr(
            "transform",
            `translate(${pos.x - pos.width / 2},${
              pos.y - pos.height / 2
            }) scale(0.5)`
          );
      }

      // Add node background rectangle
      nodeGroup
        .append("rect")
        .attr("width", pos.width)
        .attr("height", pos.height)
        .attr("rx", 6)
        .attr("ry", 6)
        .attr("fill", getColor(node.color, node.depth))
        // .attr("fill", "transparent")
        .attr("stroke", getBorder(node.color, node.depth))
        .attr("stroke-width", node.depth === 0 ? 3 : 2);

      if (node.table && node.children?.length) {
        // Add table header
        nodeGroup
          .append("text")
          .attr("x", 10)
          .attr("y", 15)
          .attr(
            "fill",
            node.depth === 0
              ? "white"
              : COLOR_SYSTEM[node.color]?.text ?? "black"
          )
          .style("font-weight", "bold")
          .style("font-size", "14px")
          .text(node.name);

        // Add table rows
        node.children.forEach((child: any, i: number) => {
          nodeGroup
            .append("text")
            .attr("x", 10)
            .attr("y", 35 + i * 20)
            .attr("fill", COLOR_SYSTEM[node.color]?.text ?? "black")
            .style("font-size", "10px")
            .text(child.name);
        });
      } else {
        // Regular node with or without image
        if (node.image) {
          // Node with image - add image and text in a foreignObject
          nodeGroup
            .append("foreignObject")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", pos.width)
            .attr("height", pos.height)
            .html(() => {
              const textContent =
                node.depth === 0 ? node.name.toUpperCase() : node.name;
              const textColor =
                node.depth === 0
                  ? "white"
                  : COLOR_SYSTEM[node.color]?.text ?? "black";
              const fontWeight = node.depth === 0 ? "bold" : "normal";
              const fontSize = node.depth === 0 ? "20px" : "18px";

              return `
                <div style="width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:8px; box-sizing:border-box; text-align:start;">
                  <img src="${node.image}" style="max-width:100%; max-height: 150px; object-fit:contain; margin-bottom:8px;" onerror="this.style.display='none';" />
                  <div style="color:${textColor}; font-weight:${fontWeight}; font-size:${fontSize};">
                    ${textContent}
                  </div>
                </div>
              `;
            });
        } else {
          // Regular node - add centered text only
          nodeGroup
            .append("text")
            .attr("x", pos.width / 2)
            .attr("y", pos.height / 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr(
              "fill",
              node.depth === 0
                ? "white"
                : COLOR_SYSTEM[node.color]?.text ?? "black"
            )
            .style("font-weight", node.depth == 0 ? "bold" : "normal")
            .style("font-size", node.depth === 0 ? "20px" : "18px")
            .text(() =>
              node.depth === 0 ? node.name.toUpperCase() : node.name
            );
        }
      }

      // Add action buttons container with initial opacity 0 (for hover buttons)
      const actionButtons = nodeGroup
        .append("g")
        .attr("class", "action-buttons")
        .style("opacity", "0") // Initially hidden
        .style("transition", "opacity 0.2s ease-in-out");

      // Add hover events to the node to show/hide hover buttons
      nodeGroup
        .on("mouseenter", function () {
          // Show action buttons on hover
          actionButtons.style("opacity", "1");
        })
        .on("mouseleave", function () {
          // Hide action buttons when not hovering
          actionButtons.style("opacity", "0");
        });

      // Add collapse/expand button - always visible, not part of the hover group
      if (hasChildren || hasHiddenChildren) {
        // Collapse/Expand button - placed at bottom-right
        const collapseButton = nodeGroup // Note: Not part of actionButtons
          .append("g")
          .attr("class", "button-collapse")
          .attr(
            "transform",
            `translate(${
              node.depth == 0
                ? pos.width / 2
                : node.side == "right"
                ? pos.width
                : 0
            }, ${node.depth == 0 ? pos.height : pos.height / 2})`
          )
          .style("cursor", "pointer")
          .on("click", function (event: { stopPropagation: () => void }) {
            event.stopPropagation();
            toggleNodeCollapse(id);
          });

        // Button circle
        collapseButton
          .append("circle")
          .attr("r", 10)
          .attr("fill", "#000")
          .attr("stroke", "#666")
          .attr("stroke-width", 1);

        // Use SVG path for the icon
        if (isCollapsed || !hasChildren) {
          // Plus icon for expand
          collapseButton
            .append("path")
            .attr(
              "d",
              node.side !== "right"
                ? ICON_PATHS.arrowRight
                : ICON_PATHS.arrowLeft
            )
            .attr("transform", "translate(-6, -6) scale(0.5)")
            .attr("fill", "none")
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round");
        } else {
          // Minus icon (horizontal line only)
          collapseButton
            .append("path")
            .attr(
              "d",
              node.side == "right"
                ? ICON_PATHS.arrowRight
                : ICON_PATHS.arrowLeft
            ) // Horizontal line only
            .attr("transform", "translate(-6, -6) scale(0.5)")
            .attr("fill", "none")
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round");
        }
      }

      // Add node button - placed at bottom-left (in hover group)
      const addButton = actionButtons
        .append("g")
        .attr("class", "button-add")
        .attr("transform", `translate(${pos.width / 2 - 25}, ${pos.height})`)
        .style("cursor", "pointer")
        .on("click", function (event: { stopPropagation: () => void }) {
          event.stopPropagation();
          handleAddNode(id);
        });

      // Button circle
      addButton
        .append("circle")
        .attr("r", 10)
        .attr("fill", "#5120C0")
        .attr("stroke", "#666")
        .attr("stroke-width", 1);

      // Plus icon using SVG path
      addButton
        .append("path")
        .attr("d", ICON_PATHS.plus)
        .attr("transform", "translate(-6, -6) scale(0.5)")
        .attr("fill", "none")
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round");

      // Don't show delete and edit buttons for root node
      if (!isRootNode) {
        // Edit button - placed at top-right (in hover group)
        const editButton = actionButtons
          .append("g")
          .attr("class", "button-edit")
          .attr("transform", `translate(${pos.width / 2}, ${pos.height})`)
          .style("cursor", "pointer")
          .on("click", function (event: { stopPropagation: () => void }) {
            event.stopPropagation();
            handleEditNode(id);
          });

        // Button circle
        editButton
          .append("circle")
          .attr("r", 10)
          .attr("fill", "#230152")
          .attr("stroke", "#666")
          .attr("stroke-width", 1);

        // Edit icon using SVG path
        editButton
          .append("path")
          .attr("d", ICON_PATHS.edit)
          .attr("transform", "translate(-6, -6) scale(0.5)")
          .attr("fill", "none")
          .attr("stroke", "#fff")
          .attr("stroke-width", 2)
          .attr("stroke-linecap", "round")
          .attr("stroke-linejoin", "round");

        // Delete button - placed at top-left (in hover group)
        const deleteButton = actionButtons
          .append("g")
          .attr("class", "button-delete")
          .attr(
            "transform",
            `translate(${pos.width / 2 + (isFirstChild ? 50 : 25)}, ${
              pos.height
            })`
          )
          .style("cursor", "pointer")
          .on("click", function (event: { stopPropagation: () => void }) {
            event.stopPropagation();
            handleDeleteNode(id);
          });

        // Button circle
        deleteButton
          .append("circle")
          .attr("r", 10)
          .attr("fill", "#D92D20")
          .attr("stroke", "#666")
          .attr("stroke-width", 1);

        // Trash icon using SVG path
        deleteButton
          .append("path")
          .attr("d", ICON_PATHS.trash)
          .attr("transform", "translate(-6, -6) scale(0.5)")
          .attr("fill", "none")
          .attr("stroke", "#fff")
          .attr("stroke-width", 2)
          .attr("stroke-linecap", "round")
          .attr("stroke-linejoin", "round");

        if (isFirstChild) {
          const colorChange = actionButtons
            .append("g")
            .attr("class", "button-color")
            .attr(
              "transform",
              `translate(${pos.width / 2 + 25}, ${pos.height})`
            )
            .style("cursor", "pointer")
            .on("click", function (event: { stopPropagation: () => void }) {
              event.stopPropagation();
              setColorPickerNode(id);
            });

          // Button circle
          colorChange
            .append("circle")
            .attr("r", 10)
            .attr("fill", "#000")
            .attr("stroke", "#666")
            .attr("stroke-width", 1);

          // Palette icon using SVG path
          colorChange
            .append("path")
            .attr("d", ICON_PATHS.palette)
            .attr("transform", "translate(-6, -6) scale(0.5)")
            .attr("fill", "none")
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round");
        }
      }
    });

    // --- Zoom & centering ---
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 2])
      .on("zoom", (event: { transform: any }) => {
        svgG.attr("transform", event.transform);
      });

    svgEl.call(zoom);

    // Calculate bounds for initial scaling
    const positions = Object.values(nodePositions);
    const minX = Math.min(...positions.map((p) => p.x - p.width / 2));
    const maxX = Math.max(...positions.map((p) => p.x + p.width / 2));
    const minY = Math.min(...positions.map((p) => p.y - p.height / 2));
    const maxY = Math.max(...positions.map((p) => p.y + p.height / 2));

    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;

    // Calculate an appropriate scale
    let scale = 0.7; // Lower default scale

    // Add padding for better visibility
    const paddingFactor = 0.8;

    // Calculate scale based on container dimensions
    try {
      scale = Math.min(
        (containerW / graphWidth) * paddingFactor,
        (containerH / graphHeight) * paddingFactor
      );

      // Limit scale to reasonable bounds
      scale = Math.max(0.3, Math.min(scale, 1.0));
    } catch (err) {
      console.warn("Scale calculation error, using default scale:", err);
    }

    // Calculate the translation needed to center the root node
    const translateX = containerW / 2;
    const translateY = containerH / 2;

    // Apply initial transform with simple translation to center
    svgEl.call(
      zoom.transform,
      d3.zoomIdentity.translate(translateX, translateY).scale(scale)
    );
  }, [data, onNodeAdd, onNodeEdit, onNodeDelete]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden transition-all border rounded relative"
    >
      <svg ref={svgRef} className="mind-map-svg w-full h-full" />

      {/* Hidden file input for image upload */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleFileUpload}
      />

      {/* Render the color picker when a node is selected for color editing */}
      {colorPickerNode && (
        <ColorPicker
          colorPickerNode={colorPickerNode}
          mindMapData={data}
          findNodeById={findNodeById}
          setColorPickerNode={setColorPickerNode}
          changeNodeColor={changeNodeColor}
          colorPalette={COLOR_PALETTE}
        />
      )}

      {/* Render the node edit modal when a node is being edited */}
      {nodeEditData && (
        <NodeEditModal
          nodeEditData={nodeEditData}
          mindMapData={data}
          findNodeById={findNodeById}
          setNodeEditData={setNodeEditData}
          saveNodeEdit={saveNodeEdit}
          extractedText={extractedText}
          setExtractedText={setExtractedText}
          isExtracting={isExtracting}
          extractTextFromImage={extractTextFromImage}
          useExtractedText={useExtractedText}
          fileInputRef={fileInputRef}
        />
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────

export const getColor = (color: string, depth: number): string => {
  const cs = COLOR_SYSTEM[color] || {};
  if (depth === 0) return "#220524";
  if (depth === 1) return cs.l1 ?? color;
  if (depth === 2) return cs.l2 ?? color;
  if (depth === 3) return cs.l3 ?? color;
  return "white";
};

export const getBorder = (color: string, depth: number): string => {
  const cs = COLOR_SYSTEM[color] || {};
  if (depth === 0) return "#220524";
  if (depth === 1) return cs.l1Border ?? color;
  if (depth === 2) return cs.l1 ?? color;
  return cs.l2 ?? color;
};

export { MindMap };
