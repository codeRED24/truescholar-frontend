export interface ArticleDataPropsDTO {
  article_id: number;
  title: string;
  slug: string;
  meta_desc?: string;
  read_time?: number | null;
  publication_date?: string | null;
  updated_at?: Date | string;
  created_at?: Date | string;
  type: string;
  tags?: string | null;
  img1_url?: string | null;
  author?: { author_id: number; author_name: string };
  img2_url?: string;
  content?: string;
}

export interface ArticlesApiResponseDTO {
  data: ArticleDataPropsDTO[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}