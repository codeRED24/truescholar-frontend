export interface DynamicFields {
  info: boolean;
  highlight: boolean;
  courses: boolean;
  fees: boolean;
  admission: boolean;
  cutoff: boolean;
  placement: boolean;
  ranking: boolean;
  scholarship: boolean;
  facility: boolean;
  faq: boolean;
  news: boolean;
}

export interface AdditionalFields {
  college_wise_course_present: boolean;
  college_wise_placement_present: boolean;
  college_wise_fees_present: boolean;
  college_ranking_present: boolean;
  college_dates_present: boolean;
  college_cutoff_present: boolean;
}

export interface CollegeInformation {
  college_id: number;
  college_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  short_name: string;
  search_names: string;
  parent_college_id?: number | null;
  city_id: number;
  state_id: number;
  country_id: number;
  location: string;
  PIN_code: string;
  latitude_longitude: string;
  college_email: string;
  college_phone: string;
  college_website: string;
  type_of_institute: string;
  affiliated_university_id?: number | null;
  founded_year: string;
  logo_img: string;
  banner_img: string;
  total_student?: number | null;
  campus_size: number;
  UGC_approved: boolean;
  kapp_rating: string;
  kapp_score: string;
  primary_stream_id: number;
  nacc_grade?: string;
  slug: string;
  girls_only: boolean;
  is_university: boolean;
  meta_desc?: string | null;
  is_online: boolean;
  college_brochure: string;
  city: string;
  state: string;
  country: string;
  course_count: number;
  dynamic_fields: DynamicFields;
  additional_fields: AdditionalFields;
}

export interface InfoSection {
  id: number;
  silos: string;
  title: string;
  description: string;
  seo_param: string;
  updated_at: string;
  is_active: boolean;
  author_name: string;
  author_image: string;
  author_id: number;
  meta_desc: string;
}
export interface CourseVal {
  course_name: string;
  kapp_rating: number;
  college_wise_course_id: number;
  duration: string;
  duration_type: string;
  direct_salary: number;
  direct_fees: number;
  seats_offered: number;
  course_brochure: string[];
  is_online: boolean;
  is_integrated_course: boolean;
  count: number;
  min_salary: number;
  max_salary: number;
  min_fees: number;
  max_fees: number;
  exam_accepted?: { exam_name: string }[];
  rating?: number;
  course_group_full_name: string;
  course_group_name: string;
  min_duration: number;
  max_duration: number;
}

export interface PopularCourse {
  course_group_name: string;
  course_group_slug: string;
  course_group_id: number;
  course_group_full_name: string;
  min_duration: number;
  max_duration: number;
  duration_in_months: number;
  stream_id: number;
  count: string;
  course_count: string;
  level: string;
  min_salary?: number | null;
  max_salary?: number | null;
  min_fees?: number | null;
  max_fees?: number | null;
  rating: string;
  kapp_score: number;
  exam_accepted: string[];
  courses: CourseVal[];
}

export interface CourseDTO {
  course_name: string;
  course_group_id: number;
  is_online: boolean;
  duration_type: string;
  is_integrated_course: boolean;
  college_wise_course_id: number;
  degree_type: string;
  seats_offered: number;
  course_brochure: (string | null)[];
  duration: number;
  kapp_score: string;
  kapp_rating: string;
  direct_fees: number;
  direct_salary: number;
}
export interface FeeDTO {
  fee_id: number;
  fee_type: string | null;
  total_min_fees: number;
  total_max_fees: number;
  description: string | null;
  total_tution_fees_min: number;
  total_tution_fees_max: number;
  min_one_time_fees: number;
  max_one_time_fees: number;
  min_hostel_fees: number;
  max_hostel_fees: number;
  min_other_fees: number;
  max_other_fees: number;
  duration: string;
  kapp_score: number | null;
  course_group_id: number;
  course_group_name: string;
  course_group_full_name: string;
}
export interface CollegeDateDTO {
  college_dates_id: number;
  created_at: string;
  updated_at: string;
  college_id: number;
  start_date: string;
  end_date: string;
  event: string;
  is_confirmed: boolean;
  description: string | null;
  refrence_url: string;
}

export interface FilterSection {
  filter_section: Record<string, Array<{ label: string }>>;
}

export interface CollegeDTO {
  college_information: CollegeInformation;
  news_section: InfoSection[];
  info_section: InfoSection[];
  popular_courses: PopularCourse[];
  exam_section: string[];
  filter_section?: FilterSection[];
  courses_section: {
    content_section: InfoSection[];
    groups: PopularCourse[];
    filter_section: any[];
  };
  fees_section: {
    content: InfoSection[];
    fees: FeeDTO[];
  };
  admission_process: {
    content: InfoSection[];
    dates: CollegeDateDTO[];
  };
}
