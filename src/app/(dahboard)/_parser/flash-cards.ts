import * as mammoth from "mammoth";

export interface TaggedImg {
  tag: string;
  data: string;
}

export interface ParsedFlashCard {
  question: string;
  answer: string;
  tag: string;
  images: TaggedImg[];
}

/**
 * Parses a .docx file and extracts structured JSON flash cards
 * Supports format: Que: / Ans: / Img-front: / Img-back: / Tag:
 */
export async function parseDocxFlashCards(
  file: File
): Promise<ParsedFlashCard[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const { value: html } = await mammoth.convertToHtml({ arrayBuffer });

    const cardHtmls = html
      .split(/(?=<p[^>]*>\s*Que:)/i)
      .map((html) => html.trim())
      .filter((html) => html.length > 0);

    const flashCards: ParsedFlashCard[] = [];

    for (let i = 0; i < cardHtmls.length; i++) {
      try {
        const card = parseHtmlCard(cardHtmls[i]);
        if (card) {
          flashCards.push(card);
        }
      } catch {
        continue;
      }
    }

    return flashCards;
  } catch {
    throw new Error(`Failed to parse DOCX`);
  }
}

/**
 * Converts HTML to plain text while preserving line breaks
 */
function htmlToText(html: string): string {
  try {
    if (typeof document !== "undefined") {
      const div = document.createElement("div");
      div.innerHTML = html;

      const paragraphs = div.querySelectorAll("p");
      paragraphs.forEach((p) => {
        p.innerHTML = p.innerHTML + "\n";
      });

      const breaks = div.querySelectorAll("br");
      breaks.forEach((br) => {
        br.replaceWith("\n");
      });

      return div.textContent || div.innerText || "";
    } else {
      return html
        .replace(/<\/p>/gi, "\n")
        .replace(/<p[^>]*>/gi, "\n")
        .replace(/<br[^>]*>/gi, "\n")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .replace(/\n\s*/g, "\n")
        .trim();
    }
  } catch {
    return html
      .replace(/<\/p>/gi, "\n")
      .replace(/<p[^>]*>/gi, "\n")
      .replace(/<br[^>]*>/gi, "\n")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .replace(/\n\s*/g, "\n")
      .trim();
  }
}

/**
 * Alternative parser that handles embedded images from mammoth
 */
export async function parseDocxWithEmbeddedImages(
  file: File
): Promise<ParsedFlashCard[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const { value: html } = await mammoth.convertToHtml({ arrayBuffer });

    const cardHtmls = html
      .split(/(?=<p[^>]*>\s*Que:)/i)
      .map((html) => html.trim())
      .filter((html) => html.length > 0);

    const flashCards: ParsedFlashCard[] = [];

    for (const cardHtml of cardHtmls) {
      try {
        const card = parseHtmlCard(cardHtml);
        if (card) {
          flashCards.push(card);
        }
      } catch {
        continue;
      }
    }

    return flashCards;
  } catch {
    throw new Error(`Failed to parse DOCX`);
  }
}

/**
 * Parses a single flash card from HTML (handles embedded images)
 */
function parseHtmlCard(cardHtml: string): ParsedFlashCard | null {
  const card: ParsedFlashCard = {
    question: "",
    answer: "",
    tag: "",
    images: [],
  };

  const embeddedImages = extractEmbeddedImages(cardHtml);

  const plainText = htmlToText(cardHtml);

  const hasImgFront = /Img-front:/i.test(plainText);
  const hasImgBack = /Img-back:/i.test(plainText);

  if (embeddedImages.length > 0) {
    if (hasImgFront && !hasImgBack) {
      embeddedImages.forEach((imgData) => {
        card.images.push({
          tag: "img-front",
          data: imgData,
        });
      });
    } else if (!hasImgFront && hasImgBack) {
      embeddedImages.forEach((imgData) => {
        card.images.push({
          tag: "img-back",
          data: imgData,
        });
      });
    } else if (hasImgFront && hasImgBack) {
      embeddedImages.forEach((imgData, idx) => {
        card.images.push({
          tag: idx === 0 ? "img-front" : "img-back",
          data: imgData,
        });
      });
    } else {
      embeddedImages.forEach((imgData, idx) => {
        card.images.push({
          tag: idx === 0 ? "img-front" : "img-back",
          data: imgData,
        });
      });
    }
  }

  const lines = plainText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let currentSection: "question" | "answer" | null = null;

  for (const line of lines) {
    if (/^que:\s*/i.test(line)) {
      card.question = line.replace(/^que:\s*/i, "").trim();
      currentSection = "question";
    } else if (/^ans:\s*/i.test(line)) {
      card.answer = line.replace(/^ans:\s*/i, "").trim();
      currentSection = "answer";
    } else if (/^img-front:\s*/i.test(line)) {
      const imgData = line.replace(/^img-front:\s*/i, "").trim();
      if (imgData) {
        const frontIndex = card.images.findIndex(
          (img) => img.tag === "img-front"
        );
        if (frontIndex >= 0) {
          card.images[frontIndex].data = imgData;
        } else {
          card.images.push({
            tag: "img-front",
            data: imgData,
          });
        }
      }
      currentSection = null;
    } else if (/^img-back:\s*/i.test(line)) {
      const imgData = line.replace(/^img-back:\s*/i, "").trim();
      if (imgData) {
        const backIndex = card.images.findIndex(
          (img) => img.tag === "img-back"
        );
        if (backIndex >= 0) {
          card.images[backIndex].data = imgData;
        } else {
          card.images.push({
            tag: "img-back",
            data: imgData,
          });
        }
      }
      currentSection = null;
    } else if (/^tag:\s*/i.test(line)) {
      card.tag = line.replace(/^tag:\s*/i, "").trim();
      currentSection = null;
    } else if (/^title:\s*/i.test(line)) {
      currentSection = null;
    } else if (currentSection && line.length > 0) {
      if (currentSection === "question") {
        card.question += " " + line;
      } else if (currentSection === "answer") {
        card.answer += " " + line;
      }
    }
  }

  if (!card.question || !card.answer) {
    return null;
  }

  return card;
}

/**
 * Extracts embedded images from HTML
 */
function extractEmbeddedImages(html: string): string[] {
  const images: string[] = [];

  try {
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
      if (match[1]) {
        images.push(match[1]);
      }
    }
  } catch {}

  return images;
}
