export interface SearchCollegeDTO {
  college_id: number;
  college_name: string;
  short_name: string | null;
  slug: string;
}

export interface SearchExamDTO {
  exam_id: number;
  exam_name: string;
  slug: string;
  exam_shortname: string;
}

export interface SearchCourseGroupDTO {
  course_group_id: number;
  slug: string;
  name: string;
  full_name: string;
}

export interface SearchArticleDTO {
  article_id: number;
  title: string;
  slug: string;
  tags: string;
}
export interface SearchResultDTO {
  college_search: SearchCollegeDTO[];
  exam_search: SearchExamDTO[];
  course_group_search: SearchCourseGroupDTO[];
  articles_search: SearchArticleDTO[];
}
