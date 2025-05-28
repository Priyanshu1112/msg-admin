// Define SVG paths for icons (from Lucide)
export const ICON_PATHS = {
    arrowLeft: "M10 19l-7-7m0 0l7-7m-7 7h18",
    arrowRight: "M14 5l7 7m0 0l-7 7m7-7H3",
    plus: "M12 5v14m-7-7h14",
    edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
    note: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7m-4-7v4h4M9 15h4m-6-4h4",
    bookmark: "M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z",
  
    palette:
      "M15.8333 2.5H12.4999C12.0579 2.5 11.6340 2.67559 11.3214 2.98816C11.0088 3.30072 10.8333 3.72464 10.8333 4.16667V14.1667C10.8333 15.0507 11.1844 15.8986 11.8096 16.5237C12.4347 17.1488 13.2825 17.5 14.1666 17.5C15.0506 17.5 15.8985 17.1488 16.5236 16.5237C17.1487 15.8986 17.4999 15.0507 17.4999 14.1667V4.16667C17.4999 3.72464 17.3243 3.30072 17.0118 2.98816C16.6992 2.67559 16.2753 2.5 15.8333 2.5Z M10.8333 6.12486L9.16664 4.45819C8.85410 4.14574 8.43025 3.97021 7.98831 3.97021C7.54637 3.97021 7.12252 4.14574 6.80998 4.45819L4.45331 6.81486C4.14086 7.12741 3.96533 7.55125 3.96533 7.99319C3.96533 8.43513 4.14086 8.85898 4.45331 9.17153L11.9533 16.6715 M6.08333 10.8333H4.16667C3.72464 10.8333 3.30072 11.0088 2.98816 11.3214C2.67559 11.634 2.5 12.0579 2.5 12.4999V15.8333C2.5 16.2753 2.67559 16.6992 2.98816 17.0118C3.30072 17.3243 3.72464 17.4999 4.16667 17.4999H14.1667 M14.1667 14.1667V14.1751",
  
    trash:
      "M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2",
    close: "M18 6L6 18M6 6l12 12",
  };
  
  // Updated color palette with exact hex codes from the image - "Border for L1" colors
  export const COLOR_PALETTE = [
    "#FDA4AF", // Rose - Border for L1
    "#F9A8D4", // Pink - Border for L1
    "#F0ABFC", // Fuchsia - Border for L1
    "#D8B4FE", // Purple - Border for L1
    "#93C5FD", // Blue - Border for L1
    "#A5F3FC", // Cyan - Border for L1
    "#5EEAD4", // Teal - Border for L1
    "#86EFAC", // Green - Border for L1
    "#BEF264", // Lime - Border for L1
    "#FDE047", // Yellow - Border for L1
    "#FDBA74", // Orange - Border for L1
    "#FCA5A5", // Red - Border for L1
  ];
  
  // Define color system with exact hex codes from the image
  export const COLOR_SYSTEM: Record<
    string,
    {
      l1Border: string; // "Border for L1" - BG color for first parent
      l1: string; // "L1 & Border for L2" - BG for L2 nodes, border for L3
      l2: string; // "L2 & Border for L3" - BG for L3 nodes, border for L4
      l3: string; // "L3" - BG for L4+ nodes
      text: string; // Text color for all nodes
    }
  > = {
    // Rose
    "#FDA4AF": {
      l1Border: "#FDA4AF",
      l1: "#FECDD3",
      l2: "#FFE4E6",
      l3: "#FFF1F2",
      text: "#9F1239",
    },
    // Pink
    "#F9A8D4": {
      l1Border: "#F9A8D4",
      l1: "#FBCFE8",
      l2: "#FCE7F3",
      l3: "#FDF2F8",
      text: "#9D174D",
    },
    // Fuchsia
    "#F0ABFC": {
      l1Border: "#F0ABFC",
      l1: "#F5D0FE",
      l2: "#FAE8FF",
      l3: "#FDF4FF",
      text: "#86198F",
    },
    // Purple
    "#D8B4FE": {
      l1Border: "#D8B4FE",
      l1: "#E9D5FF",
      l2: "#F3E8FF",
      l3: "#FAF5FF",
      text: "#6B21A8",
    },
    // Blue
    "#93C5FD": {
      l1Border: "#93C5FD",
      l1: "#BFDBFE",
      l2: "#DBEAFE",
      l3: "#EFF6FF",
      text: "#1E40AF",
    },
    // Cyan
    "#A5F3FC": {
      l1Border: "#A5F3FC",
      l1: "#CFFAFE",
      l2: "#ECFEFF",
      l3: "#F0FDFF",
      text: "#155E75",
    },
    // Teal
    "#5EEAD4": {
      l1Border: "#5EEAD4",
      l1: "#99F6E4",
      l2: "#CCFBF1",
      l3: "#F0FDFA",
      text: "#115E59",
    },
    // Green
    "#86EFAC": {
      l1Border: "#86EFAC",
      l1: "#BBF7D0",
      l2: "#DCFCE7",
      l3: "#F0FDF4",
      text: "#166534",
    },
    // Lime
    "#BEF264": {
      l1Border: "#BEF264",
      l1: "#D9F99D",
      l2: "#ECFCCB",
      l3: "#F7FEE7",
      text: "#3F6212",
    },
    // Yellow
    "#FDE047": {
      l1Border: "#FDE047",
      l1: "#FEF08A",
      l2: "#FEF9C3",
      l3: "#FEFCE8",
      text: "#854D0E",
    },
    // Orange
    "#FDBA74": {
      l1Border: "#FDBA74",
      l1: "#FED7AA",
      l2: "#FFEDD5",
      l3: "#FFF7ED",
      text: "#C2410C",
    },
    // Red
    "#FCA5A5": {
      l1Border: "#FCA5A5",
      l1: "#FEE2E2",
      l2: "#FEF2F2",
      l3: "#FFF5F5",
      text: "#B91C1C",
    },
    // Fallback color
    "#999999": {
      l1Border: "#999999",
      l1: "#AAAAAA",
      l2: "#CCCCCC",
      l3: "#EEEEEE",
      text: "#444444",
    },
  };

  