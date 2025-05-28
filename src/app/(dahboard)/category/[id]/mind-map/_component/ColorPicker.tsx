import React from "react";

interface ColorPickerProps {
  colorPickerNode: string;
  mindMapData: MindMapNode | null;
  findNodeById: (node: MindMapNode | null, id: string) => MindMapNode | null;
  setColorPickerNode: (id: string | null) => void;
  changeNodeColor: (id: string, color: string) => void;
  colorPalette: string[];
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  colorPickerNode,
  mindMapData,
  findNodeById,
  setColorPickerNode,
  changeNodeColor,
  colorPalette,
}) => {
  const node = findNodeById(mindMapData, colorPickerNode);
  if (!node) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-lg z-20 w-80">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">
          Pick a color for &quot;{node.name}&quot;
        </h3>
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={() => setColorPickerNode(null)}
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {colorPalette.map((color, index) => (
          <div
            key={index}
            className="w-12 h-12 rounded-full cursor-pointer hover:opacity-80 flex items-center justify-center"
            style={{ backgroundColor: color }}
            onClick={() => changeNodeColor(colorPickerNode, color)}
          >
            {node.color === color && (
              <span className="text-white text-lg">✓</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
