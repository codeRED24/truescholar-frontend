import Image from "next/image";

export default function UniversityComparisonHero() {
  return (
    <div className="relative h-64 md:h-80 lg:h-96">
      <Image
        src="https://pickmyuni-bucket.s3.ap-southeast-2.amazonaws.com/static/compare_banner.webp"
        alt="Library with books on shelves"
        fill
        className="object-cover"
        priority
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 flex items-end">
        <div className="container mx-auto pb-8">
          <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Compare Colleges in India
          </h1>
        </div>
      </div>
    </div>
  );
}
