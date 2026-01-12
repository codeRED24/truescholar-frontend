import { Delete } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { tagSanatize } from "../utils/tagSanatize";

const UniInfoCard: React.FC<any> = ({
  university,
  canDelete = false,
  onDelete,
}) => {
  return (
    <div className="relative flex h-full min-w-[320px] max-w-[340px] flex-col items-center justify-between rounded-2xl border-none bg-white pt-8 shadow-sm">
      {/* Logo in circle above card */}
      <div className="absolute -top-20 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center">
        <div className="flex h-32 w-32 items-center justify-center rounded-full border border-gray-100 bg-white shadow-lg">
          {university?.data?.college?.logo_img ? (
            <div className="relative h-28 w-28 overflow-hidden rounded-full">
              <Image
                src={university?.data?.college?.logo_img || "/vercel.svg"}
                alt={university?.data?.college?.college_name + " logo"}
                fill
                className="rounded-full object-contain"
              />
            </div>
          ) : (
            <div className="h-32 w-32 rounded-full bg-gray-200" />
          )}
        </div>
      </div>
      {/* Card content */}
      <div className="mb-6 mt-7 flex flex-col items-center px-4">
        <Link
          href={`/colleges/${tagSanatize(university?.data?.college?.slug)}`}
        >
          <h2 className="text-gray-7 line-clamp-1 text-center text-xl font-bold">
            {university?.data?.college?.college_name}
          </h2>
          <h2 className="line-clamp-1 text-center font-semibold leading-tight text-gray-600">
            {university?.data?.college?.location}
          </h2>
        </Link>
      </div>
      <div className="mb-2 flex w-full flex-row justify-between gap-2 px-4">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-500">COURSE</span>
          <span className="mt-1 line-clamp-2 text-base font-bold text-primary-3">
            {university?.data?.college?.CollegesCourses[0]?.name}
          </span>
        </div>
      </div>
      <div className="mt-2 w-full">
        <button
          className={`flex w-full items-center justify-center gap-2 rounded-b-2xl border-t border-gray-200 py-2 text-base font-semibold transition-colors duration-300 ${
            canDelete
              ? "bg-red-600 text-white/80 hover:text-white"
              : "cursor-not-allowed bg-[#E6EAED] text-gray-400"
          }`}
          onClick={canDelete ? onDelete : undefined}
          disabled={!canDelete}
        >
          <Delete />
          DELETE
        </button>
      </div>
    </div>
  );
};

export default UniInfoCard;
