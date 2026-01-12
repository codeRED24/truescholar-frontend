import { HomeCity } from "@/api/@types/home-datatype";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface CitiesProps {
  data: HomeCity[];
}

const Cities: React.FC<CitiesProps> = React.memo(({ data }) => {
  return (
    <div className="container-body pb-6 md:pb-12">
      <h2 className="font-bold lg:text-5xl font-public py-6">
        Top <span className="text-[#919EAB]">Cities</span>
      </h2>

      <div className="overflow-x-auto flex gap-4">
        {data.map(({ city_id, logo_url, name, college_count }) => (
          <div key={city_id} className="flex flex-col items-center">
            <div className="relative w-36 md:w-48 h-48 md:h-60">
              <Image
                src={logo_url}
                alt={`Logo of ${name}`}
                fill={true}
                className="object-cover rounded-2xl"
                sizes="(max-width: 768px) 144px, 192px"
                decoding="async"
                quality={80}
              />
              <Link
                href={`/colleges-city-${name.toLowerCase()}`}
                className="absolute inset-0 flex flex-col items-center justify-end pb-6 bg-linear-to-t from-black/60 via-black/30 to-transparent rounded-2xl"
              >
                <span
                  className="text-center font-semibold text-base text-white tracking-wider"
                  aria-label={`City name: ${name}`}
                >
                  {name.toUpperCase()}
                </span>
                <span className="text-white text-xs">
                  {college_count ?? 0}+ colleges
                </span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

Cities.displayName = "Cities";

export default Cities;
