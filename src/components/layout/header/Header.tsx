"use client";
import React, { useEffect, useState, useCallback, JSX, useRef } from "react";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  ChevronRight,
  Search,
  ArrowUpDown,
  UserIcon,
  LogOut,
} from "lucide-react";
import { formatName } from "@/components/utils/utils";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "@/lib/auth-client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { useIsTablet } from "@/components/utils/useTablet";

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

// const LeadModal = dynamic(() => import("@/components/modals/LeadModal"), {
//   ssr: false,
// });

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
  const isTablet = useIsTablet();
  const { data: session } = useSession();
  const user = session?.user;
  const searchModalRef = useRef<HTMLDivElement>(null);

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

  // Function to trigger search modal
  const triggerSearch = useCallback(() => {
    const searchButton = searchModalRef.current?.querySelector("button");
    if (searchButton) {
      searchButton.click();
    }
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
          <div className="bg-gray-2 rounded-[42px] p-4">
            <div className="h-80 overflow-y-auto mb-4">
              {stream.colleges.map((college) => (
                <Link
                  key={college.college_id}
                  href={`/colleges/${college.slug.replace(/-\d+$/, "")}-${
                    college.college_id
                  }`}
                  className="text-sm block text-gray-600 py-3 hover:text-primary-main"
                  onClick={closeNavbar} // Close navbar on click
                >
                  {college.college_name} ({college.city_name})
                </Link>
              ))}
            </div>
            <Link
              href={`/colleges-stream-${formattedStreamName}`}
              onClick={closeNavbar} // Close navbar on click
            >
              <Button className="bg-gray-8">
                View All {stream.stream_name} Colleges <ChevronRight />
              </Button>
            </Link>
          </div>
        );
      case "collegesByCity":
        return (
          <div className="bg-gray-2 rounded-[42px] p-4">
            <div className="h-80 overflow-y-auto mb-4">
              {citiesData.map((city) => (
                <Link
                  key={city.city_id}
                  href={`/colleges-city-${city.city_name}-stream-${formattedStreamName}`}
                  className="text-sm block text-gray-600 py-3 hover:text-primary-main"
                  onClick={closeNavbar} // Close navbar on click
                >
                  {stream.stream_name} Colleges in {city.city_name}
                </Link>
              ))}
            </div>
          </div>
        );
      case "exams":
        return (
          <div className="bg-gray-2 rounded-[42px] p-4">
            <div className="h-80 overflow-y-auto mb-4">
              {examsByStream[streamId]?.map((exam) => (
                <Link
                  key={exam.exam_id}
                  href={`/exams/${exam.slug}-${exam.exam_id}`}
                  className="text-sm  block text-gray-600 py-3 hover:text-primary-main"
                  onClick={closeNavbar} // Close navbar on click
                >
                  {exam.exam_name}
                </Link>
              ))}
            </div>
            <Link
              href={`/exams-stream-${stream.stream_name}`}
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

  const featureColleges = (streamId: number | null, streamName?: string) => {
    if (!streamId || !streamName) return null;
    const stream = overStreamData.find((s) => s.stream_id === streamId);
    console.log({ overStreamData });

    if (!stream) return null;

    return (
      <Carousel
        plugins={[
          Autoplay({
            delay: 2000,
          }),
        ]}
        className="w-3/4"
      >
        <CarouselContent>
          {stream.colleges.map((college, index) => (
            <CarouselItem key={index}>
              <Link
                key={college.college_id}
                href={`/colleges/${college.slug.replace(/-\d+$/, "")}-${
                  college.college_id
                }`}
                onClick={closeNavbar}
              >
                <div className=" flex flex-col items-center justify-center min-h-[281px] bg-[#00A76F14] rounded-3xl p-4">
                  <Image
                    src={college.logo_img || "/sample_college.png"}
                    alt={college.college_short_name || "Featured College"}
                    className="object-cover rounded-md"
                    height={200}
                    width={200}
                  />
                  <span className="text-center mt-2 font-bold text-primary-3 line-clamp-2">
                    {college.college_name}
                  </span>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    );
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
      {isTablet ? (
        <div className="flex justify-between items-center p-2">
          {/* Left side: Menu toggle + Logo */}
          <div className="flex items-center gap-2">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <button
                  className="text-primary-5 focus:outline-none p-2"
                  aria-label="Open navigation menu"
                >
                  <Menu className="w-6 h-6 text-gray-700" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-2 z-[101] w-[85%]">
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
                      {Object.entries(streamNames).map(
                        ([id, { name, icon }]) => (
                          <li key={id}>
                            <button
                              className="flex items-center justify-between w-full text-gray-700 font-semibold py-3 hover:text-primary-main"
                              onClick={() =>
                                setActiveStream(
                                  activeStream === Number(id)
                                    ? null
                                    : Number(id)
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
                                  activeStream === Number(id)
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                            </button>
                            {activeStream === Number(id) && (
                              <ul className="space-y-2 mt-2 animate-fadeIn">
                                {navOptions.map((option) => (
                                  <li key={option}>
                                    <button
                                      className="flex justify-between border-b font-medium text-gray-600 w-full text-left py-2 hover:text-primary-main"
                                      onClick={() =>
                                        setActiveSubSection(option)
                                      }
                                    >
                                      {getOptionLabel(option, name)}
                                      <ArrowRight />
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        )
                      )}
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
                  {/* Compare Colleges link for mobile nav */}
                  <ul className="">
                    <li>
                      <Link
                        href="/compare-colleges"
                        className="flex items-center gap-2 text-[#374151] font-semibold  py-3 hover:underline"
                        onClick={closeNavbar}
                      >
                        <ArrowUpDown className="w-4 h-4" /> Compare Colleges
                      </Link>
                    </li>
                  </ul>
                  {/* <SearchModal /> */}
                </nav>
              </SheetContent>
            </Sheet>

            <Link
              href="/"
              prefetch
              className="text-black py-1 rounded-full font-bold font-public focus:outline-none"
              aria-label="Go to homepage"
              onClick={closeNavbar}
            >
              True<span className="text-primary-main">Scholar</span>
            </Link>
          </div>

          {/* Right side: Search + User avatar */}
          <div className="flex items-center gap-2">
            {/* Simple search icon button for header */}
            <button
              className="focus:outline-none p-2 hover:bg-gray-100 rounded-full"
              aria-label="Open search"
              onClick={triggerSearch}
            >
              <Search className="w-6 h-6 text-gray-700" />
            </button>

            {/* User avatar for mobile */}
            {user && user.name ? (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="rounded-full h-8 w-8 flex items-center justify-center overflow-hidden">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name}
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="bg-[#141A21] text-white w-full h-full flex items-center justify-center text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="end">
                  <div className="text-sm font-medium text-gray-800 px-2 py-1 border-b mb-1">
                    {user.name}
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 w-full px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </PopoverContent>
              </Popover>
            ) : (
              <Link
                href="/signin"
                className="bg-[#141A21] text-white rounded-full h-8 w-8 flex items-center justify-center"
              >
                <UserIcon className="h-4 w-4 text-gray-3" />
              </Link>
            )}
          </div>
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
                    <NavigationMenuContent className="grid grid-cols-[1fr_450px_300px] gap-2 p-0 lg:w-[1000px]">
                      <ul className="p-4">
                        {navOptions.map((option) => (
                          <li
                            key={option}
                            onMouseEnter={() => setHoveredOption(option)}
                            className={`flex items-center hover:bg-gray-100 p-2 rounded-md cursor-pointer ${
                              hoveredOption === option
                                ? "text-primary-main"
                                : ""
                            }`}
                          >
                            {hoveredOption === option && (
                              <span className="mr-2">•</span>
                            )}
                            {getOptionLabel(option, name)}
                          </li>
                        ))}
                      </ul>
                      <div className="py-4">
                        {renderOptions(hoveredOption, currentStream, name)}
                      </div>
                      <div className="w-full flex flex-col items-center justify-center gap-2">
                        <span className="text-gray-8 font-semibold text-base">
                          FEATURED COLLEGES
                        </span>
                        {featureColleges(currentStream, name)}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}
                {/* Compare Colleges link for desktop nav */}
                <NavigationMenuItem
                  style={{ marginBottom: "0px", borderRadius: "100%" }}
                >
                  <Link
                    href="/compare-colleges"
                    className="flex items-center gap-1 px-4 text-gray-4 transition-colors duration-200 group hover:bg-[#00A76F] hover:text-white font-medium"
                    style={{ borderRadius: "100px", height: "36px" }}
                  >
                    <ArrowUpDown className="w-[14px] h-[14px] transition-colors duration-200 hover:text-white" />{" "}
                    Compare
                  </Link>
                </NavigationMenuItem>
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
            {user && user.name ? (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="bg-[#141A21] rounded-full h-8 px-3 flex items-center justify-center cursor-pointer hover:opacity-90">
                    <div className="rounded-full h-7 w-7 overflow-hidden flex items-center justify-center">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name}
                          width={28}
                          height={28}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="bg-gradient-to-br text-white w-full h-full flex items-center justify-center text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="end">
                  <div className="text-sm font-medium text-gray-800 px-2 py-1 mb-1 border-b">
                    {user.name}
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 w-full px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </PopoverContent>
              </Popover>
            ) : (
              <Link
                href="/signin"
                className="bg-[#141A21] text-white rounded-full h-9 w-12 flex items-center justify-center"
              >
                <UserIcon className="h-4 w-4 text-gray-3" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* SearchModal for mobile header search button */}
      <div ref={searchModalRef} className="hidden">
        <SearchModal />
      </div>
    </>
  );
};

export default Header;
