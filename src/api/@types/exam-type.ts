export interface GreExamDTO {
  examInformation: ExamInformationDTO;
  examContent: ExamContentDTO;
  distinctSilos: DistinctSiloDTO[];
  examDates: ExamDateDTO[];
}

export interface ExamInformationDTO {
  exam_id: number;
  exam_name: string;
  slug?: string;
  exam_description: string;
  exam_logo?: string;
  conducting_authority: string;
  mode_of_exam: string;
  exam_duration: number;
  exam_level: string;
  kapp_score: string;
  is_active: string;
  exam_fee_min: string | null;
  exam_fee_max: string | null;
  exam_shortname: string;
  application_start_date: string;
  application_end_date: string;
  exam_date: string;
  result_date: string | null;
  exam_category: string;
  stream_name: string;
}

export interface ExamContentDTO {
  exam_content_id: number;
  created_at: string;
  updated_at: string;
  exam_info?: string | null;
  exam_eligibility?: string | null;
  exam_result?: string | null;
  exam_imp_highlight?: string | null;
  application_process?: string | null;
  syllabus?: string | null;
  exam_pattern?: string | null;
  cutoff?: string | null;
  fees_structure?: string | null;
  application_mode?: string | null;
  eligibility_criteria?: string | null;
  result?: string | null;
  admit_card?: string | null;
  is_active: boolean;
  exam_id: number;
  refrence_url?: string | null;
  year: number;
  author_id: number;
  topic_title: string;
  description: string;
  silos: string;
  meta_desc: string;
  img1_url?: string | null;
  img2_url?: string | null;
  status: string;
  assigned_to: string;
  approved_by?: string | null;
  stage_id?: string | null;
  seo_param?: string | null;
  refrence_url_new?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_featured_img?: string | null;
  author_name: string;
  view_name: string;
  about?: string | null;
  image?: string | null;
  email: string;
  role?: string | null;
}

export interface DistinctSiloDTO {
  silos: string;
}

export interface ExamDateDTO {
  city?: string;
  examDates?: string[];
}
