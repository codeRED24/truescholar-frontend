"use client";
import React, { useEffect, useState, useCallback, JSX } from "react";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { getNavData } from "@/api/list/getNavData";
import { OverStreamSectionProps, HomeCity } from "@/api/@types/header-footer";
import { useIsMobile } from "@/components/utils/useMobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  BriefcaseBusiness,
  BriefcaseMedical,
  Palette,
  University,
  ArrowLeft,
  ArrowDown,
  ArrowRight,
  Ellipsis,
  User,
  Menu,
} from "lucide-react";
import { formatName } from "@/components/utils/utils";
import dynamic from "next/dynamic";

const DialogTitle = dynamic(
  () => import("@/components/ui/dialog").then((mod) => mod.DialogTitle),
  {
    ssr: false,
  }
);

const SearchModal = dynamic(
  () => import("@/components/miscellaneous/SearchModal"),
  {
    ssr: false,
  }
);

const LeadModal = dynamic(() => import("@/components/modals/LeadModal"), {
  ssr: false,
});

const streamNames: Record<number, { name: string; icon: JSX.Element }> = {
  10: { name: "Engineering", icon: <University size={16} /> },
  21: { name: "Management", icon: <BriefcaseBusiness size={16} /> },
  1: { name: "Medical", icon: <BriefcaseMedical size={16} /> },
  4: { name: "Design", icon: <Palette size={16} /> },
};

const navOptions = ["colleges", "collegesByCity", "exams"] as const;
type NavOption = (typeof navOptions)[number];

const Header: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [overStreamData, setOverStreamData] = useState<
    OverStreamSectionProps[]
  >([]);
  const [citiesData, setCitiesData] = useState<HomeCity[]>([]);
  const [examsByStream, setExamsByStream] = useState<
    Record<number, { exam_id: number; slug: string; exam_name: string }[]>
  >({});
  const [hoveredOption, setHoveredOption] = useState<NavOption>("colleges");
  const [currentStream, setCurrentStream] = useState<number | null>(null);
  const [scrolling, setScrolling] = useState(false);
  const [activeStream, setActiveStream] = useState<number | null>(null);
  const [activeSubSection, setActiveSubSection] = useState<NavOption | null>(
    null
  );
  const [showMoreStreams, setShowMoreStreams] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false); // State for mobile Sheet
  const isMobile = useIsMobile();

  const additionalStreams = overStreamData.filter(
    (stream) => !Object.keys(streamNames).includes(stream.stream_id.toString())
  );

  const fetchNavData = useCallback(async () => {
    setLoading(true);
    try {
      const { over_stream_section, cities_section } = await getNavData();
      setOverStreamData(over_stream_section);
      setCitiesData(cities_section.slice(0, 10));
      setExamsByStream(
        over_stream_section.reduce((acc, stream) => {
          acc[stream.stream_id] = stream.exams.map((exam) => ({
            exam_id: exam.exam_id,
            slug: exam.slug ?? "",
            exam_name: exam.exam_name,
          }));
          return acc;
        }, {} as Record<number, { exam_id: number; slug: string; exam_name: string }[]>)
      );
    } catch (error) {
      console.error("Error loading stream data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNavData();
  }, [fetchNavData]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleScroll = () => {
      setScrolling(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setScrolling(false), 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeout);
    };
  }, []);

  // Function to close navbar (Sheet on mobile)
  const closeNavbar = useCallback(() => {
    setIsSheetOpen(false); // Close mobile Sheet
    setActiveSubSection(null); // Reset subsection to collapse mobile menu
    setActiveStream(null); // Reset active stream
    setShowMoreStreams(false); // Reset more streams
  }, []);

  const renderOptions = (
    type: NavOption,
    streamId: number | null,
    streamName?: string
  ) => {
    if (!streamId || !streamName) return null;
    const stream = overStreamData.find((s) => s.stream_id === streamId);
    if (!stream) return null;

    const formattedStreamName = formatName(streamName);

    switch (type) {
      case "colleges":
        return (
          <div>
            <div className="h-80 overflow-y-auto">
              {stream.colleges.map((college) => (
                <Link
                  key={college.college_id}
                  href={`/colleges/${college.slug.replace(/-\d+$/, "")}-${
                    college.college_id
                  }`}
                  className="text-sm border-b block text-gray-600 py-3 hover:text-primary-main"
                  onClick={closeNavbar} // Close navbar on click
                >
                  {college.college_name} ({college.city_name})
                </Link>
              ))}
            </div>
            <Link
              href={`/college/${formattedStreamName}-colleges`}
              className="text-sm font-semibold block text-primary-main py-3 hover:text-primary-main"
              onClick={closeNavbar} // Close navbar on click
            >
              View All {stream.stream_name} Colleges
            </Link>
          </div>
        );
      case "collegesByCity":
        return (
          <div className="h-80 overflow-y-auto">
            {citiesData.map((city) => (
              <Link
                key={city.city_id}
                href={`/college/${formattedStreamName}-colleges-in-${city.city_id}`}
                className="text-sm border-b block text-gray-600 py-3 hover:text-primary-main"
                onClick={closeNavbar} // Close navbar on click
              >
                {stream.stream_name} Colleges in {city.city_name}
              </Link>
            ))}
          </div>
        );
      case "exams":
        return (
          <div>
            <div className="h-80 overflow-y-auto">
              {examsByStream[streamId]?.map((exam) => (
                <Link
                  key={exam.exam_id}
                  href={`/exams/${exam.slug}-${exam.exam_id}`}
                  className="text-sm border-b block text-gray-600 py-3 hover:text-primary-main"
                  onClick={closeNavbar} // Close navbar on click
                >
                  {exam.exam_name}
                </Link>
              ))}
            </div>
            <Link
              href={`/exams`}
              className="text-sm font-semibold block text-primary-main py-3 hover:text-primary-main"
              onClick={closeNavbar} // Close navbar on click
            >
              View All Exams
            </Link>
          </div>
        );
      default:
        return null;
    }
  };

  const getOptionLabel = (option: NavOption, streamName: string) => {
    switch (option) {
      case "colleges":
        return `Top ${streamName} Colleges`;
      case "collegesByCity":
        return `${streamName} Colleges By City`;
      case "exams":
        return `Top ${streamName} Exams`;
      default:
        return option;
    }
  };

  return (
    <>
      {isMobile ? (
        <div className="flex justify-between items-center p-2">
          <Link
            href="/"
            prefetch
            className="text-black py-1 rounded-full font-bold font-public focus:outline-none"
            aria-label="Go to homepage"
            onClick={closeNavbar}
          >
            True<span className="text-primary-main">Scholar</span>
          </Link>

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <button
                className="menu-icon focus:outline-none"
                aria-label="Open navigation menu"
              >
                <Menu />
              </button>
            </SheetTrigger>
            <SheetContent className="p-2 z-[101] w-[85%]">
              <DialogTitle
                asChild
                className="flex justify-between items-center bg-[#141A21] rounded-full w-fit text-white px-4 py-2.5 shadow-md"
              >
                <Link href="/" prefetch onClick={closeNavbar}>
                  True<span className="text-primary-main">Scholar</span>
                </Link>
              </DialogTitle>

              <nav className="overflow-y-auto h-full">
                {!activeSubSection ? (
                  <ul className="space-y-2">
                    {Object.entries(streamNames).map(([id, { name, icon }]) => (
                      <li key={id}>
                        <button
                          className="flex items-center justify-between w-full text-gray-700 font-semibold py-3 hover:text-primary-main"
                          onClick={() =>
                            setActiveStream(
                              activeStream === Number(id) ? null : Number(id)
                            )
                          }
                        >
                          <div
                            className={`flex items-center gap-3 ${
                              activeStream === Number(id)
                                ? "text-primary-main"
                                : "text-gray-700"
                            }`}
                          >
                            {icon} {name}
                          </div>
                          <ArrowDown
                            className={`transition-transform ${
                              activeStream === Number(id) ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {activeStream === Number(id) && (
                          <ul className="space-y-2 mt-2 animate-fadeIn">
                            {navOptions.map((option) => (
                              <li key={option}>
                                <button
                                  className="flex justify-between border-b font-medium text-gray-600 w-full text-left py-2 hover:text-primary-main"
                                  onClick={() => setActiveSubSection(option)}
                                >
                                  {getOptionLabel(option, name)}
                                  <ArrowRight />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                    {additionalStreams.length > 0 && (
                      <li>
                        <button
                          className="flex items-center justify-between w-full text-gray-700 font-semibold py-3 hover:text-primary-main"
                          onClick={() => setShowMoreStreams(!showMoreStreams)}
                        >
                          <div className="flex items-center gap-3">
                            <Ellipsis /> More
                          </div>
                          <ArrowDown
                            className={`transition-transform ${
                              showMoreStreams ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {showMoreStreams && (
                          <ul className="space-y-2 mt-2 animate-fadeIn">
                            {additionalStreams.map((stream) => (
                              <li key={stream.stream_id}>
                                <button
                                  className="flex justify-between border-b font-medium text-gray-600 w-full text-left py-2 hover:text-primary-main"
                                  onClick={() => {
                                    setActiveStream(stream.stream_id);
                                    setActiveSubSection("colleges");
                                  }}
                                >
                                  {stream.stream_name}
                                  <ArrowRight />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    )}
                  </ul>
                ) : (
                  <div className="animate-slideIn">
                    <div className="flex items-center gap-2 py-3 text-primary-main px-2">
                      <h3 className="font-semibold uppercase text-sm">
                        {getOptionLabel(
                          activeSubSection,
                          streamNames[activeStream!]?.name || "More"
                        )}
                      </h3>
                      <ArrowLeft
                        className="cursor-pointer"
                        onClick={() => setActiveSubSection(null)}
                      />
                    </div>
                    <div className="px-2">
                      {renderOptions(
                        activeSubSection,
                        activeStream,
                        streamNames[activeStream!]?.name ||
                          overStreamData.find(
                            (s) => s.stream_id === activeStream
                          )?.stream_name
                      )}
                    </div>
                  </div>
                )}
                <SearchModal />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      ) : (
        <div
          className={`fixed inset-x-0 hidden md:block container-body w-full transition-transform z-50 duration-300 ${
            scrolling ? "-translate-y-full top-0" : "translate-y-0 top-2"
          }`}
        >
          <div className="flex items-center justify-between">
            <Link
              href="/"
              prefetch
              className="bg-[#141A21] text-white px-4 py-1 rounded-full font-bold font-public"
              onClick={closeNavbar}
            >
              True<span className="text-primary-main">Scholar</span>
            </Link>
            <NavigationMenu className="bg-[#141A21] rounded-full gap-6">
              <NavigationMenuList>
                {Object.entries(streamNames).map(([id, { name, icon }]) => (
                  <NavigationMenuItem
                    key={id}
                    onMouseEnter={() => setCurrentStream(Number(id))}
                    style={{ marginBottom: "0px", borderRadius: "100%" }}
                  >
                    <NavigationMenuTrigger className="gap-2">
                      {icon} {name}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="grid grid-cols-2 gap-6 p-0">
                      <ul className="p-4">
                        {navOptions.map((option) => (
                          <li
                            key={option}
                            onMouseEnter={() => setHoveredOption(option)}
                            className="hover:bg-gray-100 p-2 rounded-md cursor-pointer"
                          >
                            {getOptionLabel(option, name)}
                          </li>
                        ))}
                      </ul>
                      <>{renderOptions(hoveredOption, currentStream, name)}</>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}
                {additionalStreams.length > 0 ? (
                  <NavigationMenuItem
                    style={{ marginBottom: "0px", borderRadius: "100%" }}
                  >
                    <NavigationMenuTrigger>More</NavigationMenuTrigger>
                    <NavigationMenuContent className="z-[101] pb-4">
                      <ul className="p-4 h-80 overflow-y-auto">
                        {additionalStreams.map((stream) => (
                          <Link
                            href={`/college/${formatName(
                              stream.stream_name
                            )}-colleges`}
                            prefetch
                            key={stream.stream_id}
                            className="text-sm border-b block text-gray-600 py-3 hover:text-primary-main"
                            onClick={closeNavbar}
                          >
                            {stream.stream_name}
                          </Link>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem
                    style={{ marginBottom: "0px", borderRadius: "100%" }}
                  >
                    <NavigationMenuTrigger>More</NavigationMenuTrigger>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
              <SearchModal />
            </NavigationMenu>
            <div className="bg-[#141A21] text-white rounded-full">
              <LeadModal
                triggerText={<User />}
                btnColor="#141A21"
                btnHeight="h-9"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
