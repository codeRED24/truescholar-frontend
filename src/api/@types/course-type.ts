export interface CourseDTO {
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
    duration?: number;
    duration_in_months?: number | null | undefined;
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
  