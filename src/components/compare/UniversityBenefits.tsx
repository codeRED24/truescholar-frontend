import { Card, CardContent } from "@/components/ui/card";
import { BenefitIcon } from "@/components/icons/BenefitIcon";

const benefits = [
  {
    title: "Make Informed Decisions",
    description:
      "Compare colleges side-by-side on fees, courses, facilities, placements, NIRF/rankings and more — choose using facts, not assumptions.",
  },
  {
    title: "Save Time & Effort",
    description:
      "Get all essential college details — eligibility, cut-offs, course lists, fees and scholarships — in one place instead of visiting multiple sites.",
  },
  {
    title: "Find Best Value for Money",
    description:
      "Compare fee structures vs. placement outcomes, faculty strength, labs and ROI to pick the most cost-effective option.",
  },
  {
    title: "Personalized Choices",
    description:
      "Filter by location, budget, entrance scores (JEE/NEET/CET etc.), course type, or state quota to find colleges that match your profile.",
  },
  {
    title: "Transparent Admission Insights",
    description:
      "See eligibility, previous year cut-offs, important application dates, counselling rounds and management quota info for each college.",
  },
  {
    title: "Compare Course Structure & Curriculum",
    description:
      "Understand which college offers industry-aligned curriculum, specialisations, internships and practical training for better job readiness.",
  },
  {
    title: "Check Authentic Reviews & Ratings",
    description:
      "Read student reviews, faculty feedback and alumni stories to get a real view of campus life and academics beyond brochures.",
  },
  {
    title: "Analyze Placement Records",
    description:
      "Compare placement rates, top recruiters, median/higher packages and internship opportunities to forecast career outcomes.",
  },
];

export default function UniversityBenefits() {
  return (
    <div>
      <div className="mb-12 text-center">
        <h3 className="mb-12 text-3xl font-bold text-primary-main">
          Key Benefits of Comparing Universities
        </h3>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit, index) => (
          <Card key={index} className="border p-2">
            <CardContent className="pt-6">
              <div className="mb-4 h-16 w-16 rounded-full">
                <BenefitIcon
                  index={index}
                  className="h-full w-full text-primary-main"
                />
              </div>
              <h4 className="font-bold text-neutral-800">{benefit.title}</h4>
              <p className="text-sm text-neutral-600">{benefit.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
