export interface SearchResult {
  id?: string;
  tagId?: number;
  type?: "scan" | "text" | "image" | "link" | "file";
  content?: string;
  desc?: string;
  url?: string;
  path?: string;
  article?: string;
  title?: string;
  deleted?: 0 | 1;
  createdAt?: number;
  searchType: string;
}
