import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { notFound } from "next/navigation";
import { UnifiedTab } from "../../../../components/UnifiedTab";
import { trimText } from "@/components/utils/utils";

async function getAuthor(authorId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/authors/${authorId}`,
    {
      next: { revalidate: 10800 },
    }
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function AuthorsPage(props: {
  params: Promise<{ authorId: string }>;
}) {
  const { authorId } = await props.params;
  // Extract numeric id from a slug-id like "john-doe-123"
  // If no trailing numeric id is found, fall back to the original value.
  const id = (() => {
    const match = String(authorId).match(/-(\d+)$/);
    return match ? match[1] : String(authorId);
  })();

  const author = await getAuthor(id);

  if (!author) return notFound();

  // Prepare available tabs
  const availableTabs = [];
  if (author.article_count?.article > 0)
    availableTabs.push({ key: "articles", label: "Articles" });
  if (author.article_count?.exam > 0)
    availableTabs.push({ key: "exams", label: "Exams" });
  if (author.article_count?.college > 0)
    availableTabs.push({ key: "colleges", label: "Colleges" });

  // Default tab
  const defaultTab = availableTabs[0]?.key || "articles";

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Header */}
      <div className="relative bg-college-head text-white pt-16 md:pt-24 pb-6 container-body min-h-60">
        <div className="relative z-10 flex items-center flex-col md:flex-row gap-6">
          <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden border-4 border-white">
            <img
              src={author.image ?? "/hero.webp"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full">
            <div className="flex items-center justify-between md:gap-4 flex-wrap">
              <p className="text-base text-[#919EAB] font-public">
                {author.role || "Author"}
              </p>
            </div>
            <div className="flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
              <h1 className="text-xl md:text-2xxl leading-6 md:leading-9 font-public font-bold line-clamp-2">
                {author.view_name || author.author_name || "Author"}
              </h1>
              <div className="flex items-center gap-4">
                <div className="text-lg font-semibold">
                  {author.article_count?.article +
                    author.article_count?.college +
                    author.article_count?.exam}
                  {"+ "}
                  <span className="text-xs font-normal">Posts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <h2 className="absolute inset-x-0 top-1/4 flex items-center justify-center text-center text-5xl md:text-8xl leading-10 md:leading-ultraWide font-public font-bold text-[#FFFFFF] opacity-20">
          {trimText(author.view_name || author.author_name || "Author", 30)}
        </h2>
      </div>

      {/* About Section */}
      {author.about && (
        <div className="container-body py-6 border-b">
          <h2 className="text-lg font-semibold mb-2">About</h2>
          <p className="text-gray-700 mb-2">{author.about}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="container-body pt-4">
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="bg-transparent w-full flex justify-start border-b border-gray-200 p-0 h-auto rounded-none">
            {availableTabs.map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className="bg-transparent text-gray-600 border-b-2 border-transparent rounded-none px-6 py-1 font-medium text-base hover:text-green-600 data-[state=active]:bg-transparent data-[state=active]:text-green-600 data-[state=active]:border-green-600 data-[state=active]:shadow-none transition-all duration-200"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {/* Tab Contents */}
          {availableTabs.map((tab) => (
            <TabsContent key={tab.key} value={tab.key} className="mt-6">
              <UnifiedTab
                // Pass numeric id-only to UnifiedTab so internal API calls use the id
                authorId={id}
                type={tab.key as "articles" | "exams" | "colleges"}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
