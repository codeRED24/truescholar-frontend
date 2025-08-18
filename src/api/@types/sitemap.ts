export interface CollegeSitemapDto {
  college_id: number;
  slug: string;
  available_tabs: string[];
}

export interface CollegeSitemapResponse {
  colleges: CollegeSitemapDto[];
  total: number;
}

export interface ExamNewsItemDto {
  news_id: number;
  title: string;
  slug: string;
}

export interface ExamSitemapDto {
  exam_id: number;
  slug: string;
  available_silos: string[];
  news_articles: ExamNewsItemDto[];
}

export interface ExamSitemapResponse {
  exams: ExamSitemapDto[];
  total: number;
}
