export interface HeaderCollege {
  college_id: number;
  slug: string;
  college_name: string | null;
  college_short_name: string | null;
  city_name: string | null;
  kapp_score: string | null;
  short_name: string | null;
}
export interface SectionProps {
  stream_id: number;
  section_name: string;
  colleges: HeaderCollege[];
}

export interface HeaderCourse {
  name: string;
  kapp_score: string;
  full_name: string;
  slug: string;
  course_group_id: number;
}

export interface FooterCollege {
  college_id: number;
  college_name: string;
  short_name?: string;
  slug?: string;
  kapp_score: string;
  college_short_name: string | null;
}

export interface HeaderExam {
  exam_id: number;
  exam_name: string;
  short_name?: string;
  exam_shortname?: string;
  kapp_score: string;
  level_of_exam: string;
  conducting_authority?: string;
  slug?: string;
}

export interface HomeCity {
  city_id: number;
  city_name: string;
}

export interface HomeStream {
  stream_id: number;
  stream_name: string;
}

export interface OverStreamSectionProps {
  stream_id: number;
  stream_name: string;
  colleges: HeaderCollege[];
  exams: HeaderExam[];
}

export interface HeaderProps {
  management_section: SectionProps;
  engineering_section: SectionProps;
  medical_section: SectionProps;
  design_section: SectionProps;
  university_section: HeaderCollege[];
  course_section: HeaderCourse[];
  exams_section: HeaderExam[];
  footer_colleges: FooterCollege[];
  cities_section: HomeCity[];
  stream_section: HomeStream[];
  over_stream_section: OverStreamSectionProps[];
}
