import * as mammoth from "mammoth";

export interface ParsedOption {
  text: string;
  isCorrect: boolean;
}
export interface TaggedImg {
  tag: string;
  data: string;
}

export interface ParsedQuestion {
  question: string;
  options: ParsedOption[];
  explanation: string;
  images: TaggedImg[];
}

/**
 * Parses a .docx file (question format) and extracts structured JSON.
 * Supports any number of options labeled with any non-whitespace prefix (e.g., A., 1), x)
 * @param file A File object representing the DOCX document
 * @returns Promise resolving to an array of ParsedQuestion objects
 */
export async function parseDocxQuestions(
  file: File
): Promise<ParsedQuestion[]> {
  const arrayBuffer = await file.arrayBuffer();

  // 1) Convert to HTML with images inlined
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer });

  const response: ParsedQuestion[] = [];

  // Split by question blocks
  const questions = html
    .split(/(?=<p>\s*Que\.)/)
    .map((b: string) => b.trim())
    .filter(Boolean);

  questions.forEach((q) => {
    const { img, rawLines } = extractContent(q);

    // Split by HTML paragraphs
    const paragraphs = rawLines
      .split("</p>")
      .filter(Boolean)
      .map((line) => {
        // 1) Remove leading <p> or whitespace
        let clean = line.replace(/^<p>\s*/, "");

        // 2) Remove empty <a id="…"></a> or any stray <a> tags
        clean = clean.replace(/<a[^>]*><\/a>/g, "");

        return clean.trim();
      });

    // Process paragraphs with smarter state tracking
    const body: ParsedQuestion = {
      question: "",
      options: [],
      explanation: "",
      images: img,
    };

    // Find correct answer
    const correctAnswer = paragraphs
      .find((l) => l.startsWith("Correct Answer: "))
      ?.split("Correct Answer: ")[1];

    // Track current parsing state
    let currentState: "question" | "option" | "explanation" | null = null;
    let currentOptionIndex: number = -1;

    // Process each paragraph
    paragraphs.forEach((paragraph, index) => {
      // First paragraph is always the question
      if (index === 0) {
        body.question = paragraph.split("Que. ")[1] || "";
        currentState = "question";
        return;
      }

      // Check for new option
      const optionMatch = paragraph.match(/^([A-Z])\)\. (.*)/);
      if (optionMatch) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, optionLetter, optionText] = optionMatch;
        body.options.push({
          text: optionText,
          isCorrect: correctAnswer === optionLetter,
        });
        currentState = "option";
        currentOptionIndex = body.options.length - 1;
        return;
      }

      // Check for explanation
      if (paragraph.startsWith("Explanation: ")) {
        body.explanation = paragraph.split("Explanation: ")[1] || "";
        currentState = "explanation";
        return;
      }

      // Check for correct answer marker (not content to process)
      if (paragraph.startsWith("Correct Answer: ")) {
        currentState = null;
        return;
      }

      // Handle continuation of previous content
      if (currentState === "question") {
        body.question += " " + paragraph;
      } else if (currentState === "option" && currentOptionIndex >= 0) {
        body.options[currentOptionIndex].text += " " + paragraph;
      } else if (currentState === "explanation") {
        body.explanation += " " + paragraph;
      }
    });

    const correct = body.options.find((o) => o.isCorrect);
    if (!correct && body.options.length > 0) {
      throw Error("No correct answer found!");
    }

    response.push(body);
  });

  return response;
}

const extractContent = (lines: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(lines, "text/html");

  const imgs = Array.from(doc.querySelectorAll("img"));
  const imageData: { tag: string; data: string }[] = [];

  imgs.forEach((img, idx) => {
    const src = img.getAttribute("src");
    if (!src) return;

    const tag = `img-${idx + 1}`;

    // 1. Store image info with tag
    imageData.push({ tag, data: src });

    // 2. Replace <img> in DOM with a text tag like `$$img-1`
    const placeholder = doc.createTextNode(`$${tag}$`);
    img.parentNode?.replaceChild(placeholder, img);
  });

  // 3. Convert cleaned HTML back to string
  const rawLines = doc.body.innerHTML;

  return { img: imageData, rawLines };
};
