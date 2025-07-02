export interface HomeCollege {
  college_id: number;
  college_name: string;
  short_name: string;
  slug: string;
  city_id: number;
  city_name: string;
  state_id: number;
  state_name: string;
  kapp_rating: number | null;
  parent_college_id: number | null;
  min_tuition_fees: number;
  max_tuition_fees: number;
  min_tution_fees: number;
  max_tution_fees: number;
  no_of_courses: string;
  nacc_grade: string;
  UGC_approved: boolean;
  college_logo: string;
  logo_img: string;
  location: string;
  banner_img: string;
  primary_stream_id: number;
  type_of_institute: string;
  stream_name: string;
  NIRF_ranking: string;
  course_count: number;
  founded_year: number;
  min_salary: number;
  max_salary: number;
  affiliated_university_name: string;
}

export interface HomeStream {
  stream_id: number;
  stream_name: string;
  colleges: HomeCollege[];
}

export interface HomeCourse {
  course_id: number;
  created_at?: string;
  updated_at?: string;
  last_edited_by?: string | null;
  full_name?: string;
  course_name: string;
  name: string;
  is_online: boolean | null;
  short_name: string;
  description: string;
  slug: string;
  duration: number;
  last_update?: string | null;
  is_active: boolean;
  is_approved?: boolean | null;
  course_code?: string | null;
  online_only?: boolean | null;
  kap_score?: string | null;
  key_article?: string | null;
  course_format?: string | null;
  degree_type?: string | null;
  is_integrated_course: boolean;
  eligibility?: string | null;
  level?: string | null;
  course_group_id: number;
  specialization_id: number;
}

export interface HomeCoursesSection {
  courses: HomeCourse[];
}

export interface HomeCity {
  city_id: number;
  name: string;
  city_name: string;
  logo_url: string;
  kapp_score: string;
  college_count: number;
}

export interface HomeArticle {
  article_id: number;
  title: string;
  sub_title?: string | null;
  meta_desc?: string;
  slug: string;
  updated_at: string;
  read_time: number;
  content: string;
}

export interface HomeExam {
  exam_id: number;
  exam_name: string;
  exam_shortname: string;
  slug: string;
  exam_logo: string;
  exam_duration: number;
  exam_subject: string | null;
  exam_description: string;
  mode_of_exam: string;
  level_of_exam: string;
  exam_fee_min: number | null;
  exam_fee_max: number | null;
  exam_date: string;
  official_website: string | null;
  application_start_date: string;
  application_end_date: string;
}

export interface HomeData {
  top_colleges: HomeStream[];
  top_private_colleges_sections: HomeStream[];
  courses_section: HomeCoursesSection;
  top_cities: HomeCity[];
  news_section: HomeArticle[];
  upcoming_exams: HomeExam[];
  online_section: HomeCollege[];
}
