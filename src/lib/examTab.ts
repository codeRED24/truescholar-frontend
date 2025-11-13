// Utility functions to map exam silo slugs from backend to frontend paths
// and to build full exam tab URLs, similar to collegeTab mappings.

/**
 * Maps raw silo values from the backend to the corresponding frontend tab path.
 *
 * Backend silos (examples):
 *  'exam-imp-highlight',
 *  'exam-application-process',
 *  'exam-eligibility-criteria',
 *  'exam-syllabus',
 *  'exam-pattern',
 *  'exam-cutoff',
 *  'admit-card',
 *  'exam-result',
 *  'exam-info',
 *  'exam-centers',
 *  'exam-faq',
 *  'news'
 *
 * Frontend usage reference:
 *  See [`truescholar-frontend/src/components/page/exam/ExamNav.tsx`](truescholar-frontend/src/components/page/exam/ExamNav.tsx:1)
 */
export function mapExamSiloToPath(raw: string): string {
  if (!raw) return "";

  const normalized = raw.trim().toLowerCase().replace(/\s+/g, "-");

  switch (normalized) {
    // Base info / default page
    case "exam-info":
    case "exam_info":
    case "info":
      return "";

    // Highlights
    case "exam-imp-highlight":
    case "exam_imp_highlight":
      return "/exam-imp-highlight";

    // Application Process
    case "exam-application-process":
    case "exam_application_process":
      return "/exam-application-process";

    // Eligibility Criteria
    case "exam-eligibility-criteria":
    case "exam_eligibility_criteria":
      return "/exam-eligibility-criteria";

    // Syllabus
    case "exam-syllabus":
    case "exam_syllabus":
      return "/exam-syllabus";

    // Exam Pattern
    case "exam-pattern":
    case "exam_pattern":
      return "/exam-pattern";

    // Cutoff
    case "exam-cutoff":
    case "exam_cutoff":
    case "cutoff":
      return "/exam-cutoff";

    // Admit Card
    case "admit-card":
    case "admit_card":
      return "/admit-card";

    // Result
    case "exam-result":
    case "exam_result":
    case "result":
      return "/exam-result";

    // Exam Centers
    case "exam-centers":
    case "centers":
      return "/centers";

    // FAQ
    case "exam-faq":
    case "exam_faq":
    case "faq":
      return "/exam-faq";

    // News
    case "news":
      return "/news";

    // Question Papers (present in ExamNav navItems)
    case "question-papers":
    case "question_papers":
      return "/question-papers";

    // Books
    case "books":
      return "/books";

    // Answer Key
    case "answer-key":
    case "answer_key":
      return "/answer-key";

    // Analysis
    case "analysis":
      return "/analysis";

    // Preparation
    case "preparation":
      return "/preparation";

    // Counselling
    case "counselling":
      return "/counselling";

    // Notification
    case "notification":
      return "/notification";

    // Recruitment
    case "recruitment":
      return "/recruitment";

    // Vacancies
    case "vacancies":
      return "/vacancies";

    // Slot Booking
    case "slot-booking":
    case "slot_booking":
      return "/slot-booking";

    default:
      // Unknown silo: default to base exam page
      return "";
  }
}

/**
 * Build a full exam tab URL based on base path and backend silo.
 * @param basePath Base path for the exam (e.g., "/exams/jee-main-123").
 * @param silo Raw silo string from backend.
 * @returns Full URL pointing to the correct tab.
 */
export function getExamTabUrl(basePath: string, silo: string): string {
  const segment = mapExamSiloToPath(silo);
  return `${basePath}${segment}`;
}
