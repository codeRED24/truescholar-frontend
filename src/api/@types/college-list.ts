interface BaseFilterItem {
  count?: number;
}

interface CityFilterItem extends BaseFilterItem {
  city_id?: number;
  city_name?: string;
  city_slug?: string;
}

interface StateFilterItem extends BaseFilterItem {
  state_id?: number;
  state_name?: string;
  state_slug?: string;
}

interface StreamFilterItem extends BaseFilterItem {
  stream_id?: number;
  stream_name?: string;
  stream_slug?: string;
}

interface TypeOfInstituteFilterItem extends BaseFilterItem {
  value?: string;
}

interface SpecializationFilterItem extends BaseFilterItem {
  name?: string;
}

export interface FilterSectionDTO {
  city_filter: CityFilterItem[];
  state_filter: StateFilterItem[];
  stream_filter: StreamFilterItem[];
  type_of_institute_filter: TypeOfInstituteFilterItem[];
  specialization_filter: SpecializationFilterItem[];
}

interface CollegeRanking {
  nirf_ranking?: string;
  times_ranking?: string;
  india_today_ranking?: string;
}

export interface CollegeDTO {
  college_id: number;
  slug: string;
  college_name: string;
  short_name: string;
  city_id: number;
  is_active: boolean;
  city_name: string;
  state_id: number;
  state_name: string;
  kapp_rating: string;
  parent_college_id: number | null;
  no_of_courses: number;
  nacc_grade: string;
  UGC_approved: boolean;
  college_logo: string;
  banner_img: string;
  logo_img?: string;
  primary_stream_id: number | null;
  type_of_institute: string | null;
  is_university: boolean;
  affiliated_university_id: number | null;
  affiliated_university_name: string;
  stream_name: string | null;
  min_salary: number | null;
  max_salary: number | null;
  min_fees: number | null;
  max_fees: number | null;
  city_slug: string;
  state_slug: string;
  stream_slug: string | null;
  college_brochure: string | null;
  rankings?: CollegeRanking;
}

export interface CollegesResponseDTO {
  filter_section: FilterSectionDTO;
  colleges: CollegeDTO[];
  total_colleges_count: number;
}
