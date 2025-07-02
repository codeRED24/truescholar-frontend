"use client";

import * as cheerio from "cheerio";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/components/utils/useMobile";
import { memo, useState, useEffect } from "react";

interface TOCItem {
  id: string;
  text: string;
  level: string;
}

interface TOCGeneratorProps {
  content: string;
}

const extractHeadings = (content: string): TOCItem[] => {
  const $ = cheerio.load(content);
  return $("h2[id^='toc-'], h3[id^='toc-']")
    .slice(0, 20)
    .map((_, heading) => ({
      id: $(heading).attr("id") || "",
      text: $(heading).text().trim(),
      level: heading.tagName.toLowerCase(),
    }))
    .get();
};

const TOCGenerator: React.FC<TOCGeneratorProps> = ({ content }) => {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setTocItems(extractHeadings(content));
      setLoading(false);
    }, 500);
  }, [content]);

  if (!tocItems.length && !loading) return null;

  const handleScroll = (id: string) => {
    const targetElement = document.getElementById(id);
    if (targetElement) {
      const offset = 80;
      const targetPosition =
        targetElement.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: targetPosition, behavior: "smooth" });
      setIsOpen(false);
    }
  };

  const tocContent = loading
    ? new Array(10)
        .fill("")
        .map((_, index) => (
          <div
            key={index}
            className="h-4 bg-gray-300 animate-pulse rounded w-3/4 my-2"
          />
        ))
    : tocItems.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="flex toc-item text-sm md:text-base font-medium"
          aria-label={`Navigate to ${item.text}`}
          onClick={(e) => {
            e.preventDefault();
            handleScroll(item.id);
          }}
        >
          {item.text}
        </a>
      ));

  return isMobile ? (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          aria-label="Open Section Overview"
          className="fixed bottom-4 inset-x-0 w-1/2 mx-auto z-[101] flex items-center gap-2 bg-primary-1 border border-primary-main rounded-2xl py-1 px-3 shadow-md transition hover:bg-primary-1 focus:outline-none focus:ring-1 focus:ring-primary-main"
          onClick={() => setIsOpen(true)}
        >
          📋 <span className="text-sm font-medium">Section Overview</span>
        </button>
      </DialogTrigger>
      <DialogContent
        className="max-w-[340px] sm:max-w-[425px] px-2 focus:outline-none rounded-2xl"
        aria-labelledby="toc-dialog-title"
      >
        <DialogTitle id="toc-dialog-title" className="sr-only">
          Section Overview
        </DialogTitle>
        <div className="max-h-96 overflow-y-auto">
          <DialogClose
            className="text-left space-y-2"
            role="navigation"
            aria-label="Section Overview Links"
          >
            {tocContent}
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  ) : (
    <div className="article-content-body">
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger
            className="font-bold text-sm md:text-lg py-0 hover:no-underline focus:outline-none"
            aria-label="Toggle Section Overview"
          >
            Section Overview
          </AccordionTrigger>
          <AccordionContent
            className="space-y-2 focus:outline-none pt-4"
            role="navigation"
            aria-label="Section Overview Links"
          >
            {tocContent}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default memo(TOCGenerator);
