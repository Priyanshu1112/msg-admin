/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from "xlsx";
import { COLOR_PALETTE } from "./constants";

// Original (raw) tree node
export interface MindMapNode {
  title: string;
  children: MindMapNode[];
}

// New shape for your output
export interface ExtendedMindMapNode {
  id: string;
  name: string;
  color: string;
  children: ExtendedMindMapNode[];
  _children: ExtendedMindMapNode[];
  side: "right" | "left";
}

/**
 * Generate a random 10-char alphanumeric ID.
 */
function generateId(): string {
  return Math.random().toString(36).substr(2, 10);
}

/**
 * Convert a raw MindMapNode[] into ExtendedMindMapNode[], tagging depth, colors, etc.
 */
function convertNodes(
  nodes: MindMapNode[],
  depth: number,
  parentColor?: string,
  parentSide: "left" | "right" = "left"
): ExtendedMindMapNode[] {
  return nodes.map((n, ind) => {
    // pick a random color for level-2 nodes
    const colorCode =
      COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];

    // alternate only at depth===1; otherwise inherit parentSide
    const side = depth === 2 ? (ind % 2 === 0 ? "left" : "right") : parentSide;

    const ex: ExtendedMindMapNode = {
      id: generateId(),
      name: n.title,
      color:
        depth === 1
          ? "#93C5FD" // level-1 color
          : depth === 2
          ? colorCode // level-2 random
          : parentColor ?? "#000", // deeper inherit
      children: [],
      _children: [],
      side,
    };

    // recurse, passing down current side as parentSide:
    ex.children = convertNodes(
      n.children,
      depth + 1,
      depth === 2 ? colorCode : parentColor,
      side
    );

    return ex;
  });
}

/**
 * Parses a mind-map hierarchy from an Excel File into the final ExtendedMindMapNode tree.
 *
 * @param file     Excel File object (from <input type="file">)
 * @param sheetName Optional sheet name (defaults to first sheet)
 * @returns Promise resolving to a single root ExtendedMindMapNode
 */

export async function parseMindMap(file: File): Promise<ExtendedMindMapNode> {
  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  const workbook = XLSX.read(data, { type: "array" });
  const name = workbook.SheetNames[0];
  const sheet = workbook.Sheets[name];

  const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    blankrows: false,
  });

  const rootPlaceholder: MindMapNode = { title: "ROOT", children: [] };
  const stack: MindMapNode[] = [];

  for (const row of rows) {
    const nonEmptyCols = row
      .map((cell: any, idx: number) => (cell != null && cell !== "" ? idx : -1))
      .filter((idx: number) => idx >= 0);

    for (const colIdx of nonEmptyCols) {
      const text = String(row[colIdx]).trim();
      const node: MindMapNode = { title: text, children: [] };

      if (colIdx === 0) {
        rootPlaceholder.children.push(node);
      } else {
        const parent = stack[colIdx - 1] || rootPlaceholder;
        parent.children.push(node);
      }

      stack[colIdx] = node;
      stack.length = colIdx + 1;
    }
  }

  const level1 = convertNodes(rootPlaceholder.children, 1);
  const topName = level1.length === 1 ? level1[0].name : "ROOT";

  let finalChildren: ExtendedMindMapNode[];

  if (level1.length === 1 && level1[0].name === topName) {
    // Avoid duplicate if first child is same as root title
    finalChildren = level1[0].children;
  } else {
    finalChildren = level1;
  }

  const finalRoot: ExtendedMindMapNode = {
    id: "root",
    name: topName,
    color: "#222",
    children: finalChildren,
    _children: [],
    side: "left",
  };

  return finalRoot;
}
