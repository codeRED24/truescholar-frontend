import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UniversityComparisonCTA() {
  return (
    <section className="bg-primary-main mt-16">
      <div className="container mx-auto flex flex-col items-center justify-center py-12 lg:py-16">
        <h1 className="mb-6 text-3xl font-bold text-white md:text-4xl">
          Compare. Choose. Succeed
        </h1>
        <Link href="/top-universities-in-australia">
          <Button className="flex items-center bg-white text-primary-main">
            Start Your College Search Today!
          </Button>
        </Link>
      </div>
    </section>
  );
}
