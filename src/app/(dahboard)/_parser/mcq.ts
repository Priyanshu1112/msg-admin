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
  tags: string[];
  images: TaggedImg[];
}

export async function parseDocxQuestions(
  file: File
): Promise<ParsedQuestion[]> {
  const arrayBuffer = await file.arrayBuffer();
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer });

  const response: ParsedQuestion[] = [];

  const questions = html
    .split(/(?=<p>\s*Que\.)/)
    .map((b: string) => b.trim())
    .filter(Boolean);

  questions.forEach((q) => {
    const { img, rawLines } = extractContent(q);

    const paragraphs = rawLines
      .split("</p>")
      .filter(Boolean)
      .map((line) => {
        let clean = line.replace(/^<p>\s*/, "");
        clean = clean.replace(/<a[^>]*><\/a>/g, "");
        return clean.trim();
      });

    const body: ParsedQuestion = {
      question: "",
      options: [],
      explanation: "",
      tags: [],
      images: img,
    };

    const correctAnswer = paragraphs
      .find((l) => l.startsWith("Correct Answer: "))
      ?.split("Correct Answer: ")[1];

    let currentState: "question" | "option" | "explanation" | "tag" | null =
      null;
    let currentOptionIndex: number = -1;

    paragraphs.forEach((paragraph, index) => {
      if (index === 0) {
        body.question = paragraph.split("Que. ")[1] || "";
        currentState = "question";
        return;
      }

      const optionMatch = paragraph.match(/^([A-Z])\)\. (.*)/);
      if (optionMatch) {
        const [_, optionLetter, optionText] = optionMatch;
        body.options.push({
          text: optionText,
          isCorrect: correctAnswer === optionLetter,
        });
        currentState = "option";
        currentOptionIndex = body.options.length - 1;
        return;
      }

      if (paragraph.startsWith("Explanation: ")) {
        body.explanation = paragraph.split("Explanation: ")[1] || "";
        currentState = "explanation";
        return;
      }

      console.log(paragraph);
      if (paragraph.startsWith("Tag: ")) {
        const tagLine = paragraph.split("Tag: ")[1] || "";
        body.tags = tagLine
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        currentState = "tag";
        return;
      }

      if (paragraph.startsWith("Correct Answer: ")) {
        currentState = null;
        return;
      }

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

  console.log(response);
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
    imageData.push({ tag, data: src });

    const placeholder = doc.createTextNode(`$${tag}$`);
    img.parentNode?.replaceChild(placeholder, img);
  });

  const rawLines = doc.body.innerHTML;

  return { img: imageData, rawLines };
};
