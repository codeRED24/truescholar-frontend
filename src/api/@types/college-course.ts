type BasicInfo = {
    college_id: number;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    is_online: boolean;
    girls_only: boolean;
    college_name: string;
    short_name: string;
    slug: string;
    search_names: string | null;
    parent_college_id: number | null;
    city_id: number;
    state_id: number;
    country_id: number;
    location: string;
    PIN_code: string | null;
    latitude_longitude: string | null;
    college_email: string | null;
    college_phone: string | null;
    college_website: string | null;
    refrence_url: string;
    type_of_institute: string;
    affiliated_university_id: number | null;
    founded_year: string;
    logo_img: string;
    nacc_grade: string;
    banner_img: string;
    total_student: number | null;
    campus_size: number | null;
    UGC_approved: boolean;
    meta_desc: string | null;
    is_university: boolean;
    kapp_rating: string;
    kapp_score: string;
    primary_stream_id: number;
  };
  
  type CollegeWiseCourse = {
    college_wise_course_id: number;
    created_at: string;
    updated_at: string;
    name: string;
    description: string;
    fees: number;
    salary: number;
    eligibility: string;
    eligibility_description: string;
    is_online: boolean;
    level: string;
    course_format: string;
    degree_type: string;
    is_integrated_course: boolean;
    duration_type: string;
    duration: number;
    highlight: string;
    admission_process: string;
    overview: string;
    total_seats: number;
    syllabus: string;
    course_brochure: string;
    kapp_score: string | null;
    kapp_rating: string;
    college_id: number;
    course_id: number | null;
    is_active: boolean;
    course_group_id: number;
    refrence_url: string;
  };
  
  type CourseGroupSection = {
    course_group_id: number;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    kapp_score: string;
    slug: string;
    name: string;
    description: string | null;
    full_name: string;
    type: string | null;
    level: string;
    duration_in_months: number;
    stream_id: number;
  };
  
  type CollegeRanking = {
    college_ranking_id: number;
    created_at: string;
    updated_at: string;
    ranking_agency_name: string;
    college_id: number;
    ranking_agency_id: number;
    agency: string | null;
    agency_logo: string | null;
    ranking_agency_image: string | null;
    rank: number;
    course_group_id: number;
    stream_id: number;
    description: string;
    category: string;
    year: number;
    rank_title: string;
    rank_subtitle: string | null;
    refrence_url: string;
    max_rank: number | null;
  };
  
  type CollegeWiseFees = {
    collegewise_fees_id: number;
    created_at: string;
    updated_at: string;
    is_active: boolean | null;
    kapp_score: string | null;
    total_min_fees: number;
    total_max_fees: number;
    tution_fees_min_amount: number;
    tution_fees_max_amount: number;
    min_one_time_fees: number;
    max_one_time_fees: number;
    max_hostel_fees: number;
    min_hostel_fees: number;
    min_other_fees: number;
    max_other_fees: number;
    tution_fees_description: string | null;
    other_fees: string | null;
    year: string | null;
    quota: string | null;
    duration: string;
    college_id: number;
    refrence_url: string;
    collegewise_course_id: number | null;
    course_group_id: number;
  };
  type CollegePlacementSection = {
    collegewise_placement_id: number;
    created_at: string;
    updated_at: string;
    college_id: number;
    year: number;
    highest_package: number | null;
    avg_package: number | null;
    median_package: number | null;
    top_recruiters: string | null;
    particulars: string;
    category: string | null;
    title: string;
    title_value: number;
    placement_percentage: number | null;
    description: string | null;
    refrence_url: string;
  };
  export type {
    BasicInfo,
    CollegeWiseCourse,
    CourseGroupSection,
    CollegeRanking,
    CollegeWiseFees,
    CollegePlacementSection,
  };