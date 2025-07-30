import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

const benefits = [
  {
    title: "Find the Best Fit for Your Goals",
    description:
      "Choose a university that aligns with your goals and future prospects.",
  },
  {
    title: "Understand Tuition Fees & Costs",
    description:
      "Compare university fees, tuition, scholarships & living costs to budget smartly.",
  },
  {
    title: "Check Course Quality & Recognition",
    description: "Pick accredited programs with strong industry recognition.",
  },
  {
    title: "Explore Post-Graduation Opportunities",
    description: "Find universities with top placements & industry links.",
  },
  {
    title: "Assess Campus Life & Student Support",
    description: "Ensure a welcoming campus with great support services.",
  },
  {
    title: "Location & Lifestyle Considerations",
    description:
      "City, coast, or countryside—choose what suits your lifestyle.",
  },
  {
    title: "Visa & PR Pathways",
    description: "Explore visa options and permanent residency pathways.",
  },
];

export default function UniversityBenefits() {
  return (
    <div>
      <div className="mb-12 text-center">
        <h3 className="mb-12 text-3xl font-bold text-blue-600">
          Key Benefits of Comparing Universities
        </h3>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit, index) => (
          <Card key={index} className="border-0 p-6 shadow-sm">
            <CardContent className="pt-6">
              <div className="mb-4 h-16 w-16 rounded-full">
                <Image
                  src={`/benefit${index + 1}.svg`}
                  width={70}
                  height={70}
                  alt="Icon"
                  loading="lazy"
                  quality={25}
                />
              </div>
              <h4 className="mb-3 font-bold text-blue-600">{benefit.title}</h4>
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
