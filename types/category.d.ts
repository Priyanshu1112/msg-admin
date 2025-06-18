interface Subject {
  id: string;
  name: string;
  country: string;
  course: IdName;
  stream: IdName;
  year: number[];
  _count: {
    chapters: number;
    topics: number;
    mindMaps: number;
    questions: number;
  };
}

interface Chapter {
  id: string;
  name: string;
  subject: IdName;
  _count: {
    topics: number;
    mindMaps: number;
    questions: number;
  };
}

interface Topic {
  id: string;
  name: string;
  chapter: IdName;
  _count: {
    mindMaps: number;
    question: number;
    flashCard: number;
  };
}

interface Stream {
  id: string;
  name: string;
  course: IdName[];
}
