// ✅ Interfaces
interface CountStats {
  topics: number;
  mindMaps: number;
  questions: number;
  flashCard: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

// Interfaces
interface IdName {
  id: string;
  name: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
}
