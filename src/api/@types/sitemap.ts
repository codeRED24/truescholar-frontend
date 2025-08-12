export interface CollegeSitemapDto {
  college_id: number;
  slug: string;
  available_tabs: string[];
}

export interface CollegeSitemapResponse {
  colleges: CollegeSitemapDto[];
  total: number;
}
