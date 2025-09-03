"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  Send,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  GraduationCap,
  FileText,
  Award,
  TrendingUp,
  Bot,
} from "lucide-react";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Conversation, ConversationContent } from "@/components/conversation";
import { Message, MessageContent, MessageAvatar } from "@/components/message";
import { Response } from "@/components/response";
import AnimatedBlobLogo from "./ai-blob";

interface ChatbotWidgetProps {
  cardConfig: any;
}

const dummyQuestions: Record<string, Record<string, string[]>> = {
  Colleges: {
    All: [
      "What are the top colleges in India?",
      "How to choose the right college?",
      "What are admission requirements?",
    ],
    Admissions: [
      "What is the admission process?",
      "What documents are needed?",
      "When are application deadlines?",
    ],
    Fees: [
      "What are the tuition fees?",
      "Are there scholarships available?",
      "What are payment options?",
    ],
    Facility: [
      "What facilities are available?",
      "What is the campus like?",
      "Are there hostels?",
    ],
    Placements: [
      "What are placement statistics?",
      "Which companies visit?",
      "What is the average salary?",
    ],
  },
  Exams: {
    All: [
      "What exams should I take?",
      "How to prepare for entrance exams?",
      "What are the exam patterns?",
    ],
    Syllabus: [
      "What is the exam syllabus?",
      "Which topics are important?",
      "How to cover the syllabus?",
    ],
    Dates: [
      "When are the exam dates?",
      "What is the application timeline?",
      "Are there multiple exam sessions?",
    ],
    Eligibility: [
      "What are the eligibility criteria?",
      "What qualifications are required?",
      "Are there age restrictions?",
    ],
  },
  Scholarships: {
    All: [
      "What scholarships are available?",
      "How to apply for scholarships?",
      "What are the eligibility criteria?",
    ],
    Government: [
      "What government scholarships exist?",
      "How to apply for government schemes?",
      "What documents are needed?",
    ],
    Private: [
      "What private scholarships are available?",
      "How to find private funding?",
      "What are the application processes?",
    ],
    "By College": [
      "Which colleges offer scholarships?",
      "What are college-specific scholarships?",
      "How to apply through colleges?",
    ],
  },
  "College Predictions": {
    All: [
      "How to predict college admission?",
      "What factors affect predictions?",
      "How accurate are predictions?",
    ],
    "By Rank": [
      "How does rank affect admission?",
      "What ranks get which colleges?",
      "How to improve my rank?",
    ],
    "By Score": [
      "How do scores affect admission?",
      "What scores are required?",
      "How to calculate admission chances?",
    ],
  },
};

export default function ChatbotWidget({ cardConfig }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"questions" | "chat">("questions");
  const [activeTab, setActiveTab] = useState<string>("Colleges");
  const [activeSubTab, setActiveSubTab] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<
    Record<string, Record<string, string[]>>
  >({});
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Fetch questions with browser caching
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      const cacheKey = "chatbotQuestions";
      const now = Date.now();
      let data: Record<string, Record<string, string[]>> = {};

      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          const { questions: cachedQuestions, expiry } = JSON.parse(cachedData);
          if (expiry > now) {
            data = cachedQuestions;
            setQuestions(data);
            setLoading(false);
            return;
          } else {
            localStorage.removeItem(cacheKey); // Expired cache
          }
        } catch (e) {
          localStorage.removeItem(cacheKey); // Invalid cache
        }
      }

      if (Object.keys(data).length === 0) {
        try {
          const baseUrl =
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
          const response = await fetch(`${baseUrl}/api/predefined-questions`);
          if (response.ok) {
            data = await response.json();
            const expiry = now + 24 * 60 * 60 * 1000; // 24 hours
            localStorage.setItem(
              cacheKey,
              JSON.stringify({ questions: data, expiry })
            );
          }
        } catch (error) {
          console.error("Failed to fetch predefined questions:", error);
        }
      }

      setQuestions(data);
      setLoading(false);
    };

    fetchQuestions();
  }, []);

  // Detect small screen size
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 640); // Tailwind sm breakpoint
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [input, setInput] = useState("");
  const subTabsContainerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onFinish: () => {
      setView("chat");
    },
  });

  const handleQuestionClick = (question: string) => {
    if (status !== "ready") return;
    sendMessage({ text: question });
    setView("chat");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== "ready") return;
    sendMessage({ text: input });
    setInput("");
    setView("chat");
  };

  const handleScroll = () => {
    if (subTabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        subTabsContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1); // -1 for precision
    }
  };

  useEffect(() => {
    const container = subTabsContainerRef.current;
    if (container) {
      handleScroll();
      container.addEventListener("scroll", handleScroll);
      // A resize observer is needed to re-calculate on resize
      const resizeObserver = new ResizeObserver(() => handleScroll());
      resizeObserver.observe(container);

      return () => {
        container.removeEventListener("scroll", handleScroll);
        resizeObserver.unobserve(container);
      };
    }
  }, [view]);

  const scroll = (direction: "left" | "right") => {
    if (subTabsContainerRef.current) {
      const scrollAmount = direction === "left" ? -120 : 120;
      subTabsContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollToCard = (index: number) => {
    if (cardsContainerRef.current) {
      const card = cardsContainerRef.current.children[index] as HTMLElement;
      if (card) {
        card.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  };

  // Extract shared widget content
  const widgetContent = (
    <>
      {/* Header */}
      <div
        className={`flex flex-shrink-0 items-center justify-between p-3 text-black ${
          !isSmallScreen ? "rounded-t-2xl" : ""
        }`}
      >
        <div className="flex items-center">
          {view === "chat" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setView("questions");
                setMessages([]); // Clear chat history when going back
              }}
              className="mr-1 h-8 w-8 rounded-full"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Button>
          )}
          <h3 className="font-bold text-gray-800 ml-2">TrueScholar AI</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-8 w-8 rounded-full"
        >
          <X className="h-5 w-5 text-gray-500" />
        </Button>
      </div>

      {view === "questions" && (
        <div className="flex-grow overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex flex-col items-center px-4 pt-4">
            <div className="mb-4">
              {/* <Image
                src="/img/logo-new.png"
                alt="Truescholar AI"
                width={60}
                height={60}
                className="rounded-full"
              /> */}
              <AnimatedBlobLogo size={100} title="TS" palette="tealGreen" />
            </div>
          </div>

          {/* Cards Container */}
          <div
            ref={cardsContainerRef}
            className="flex w-full gap-x-4 snap-x snap-mandatory overflow-x-auto px-4 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {Object.entries(
              cardConfig as Record<
                string,
                { subTabs: string[]; icon: string; description: string }
              >
            ).map(([tabName, card], index) => {
              const currentSubTab = card.subTabs.includes(activeSubTab)
                ? activeSubTab
                : card.subTabs[0];
              const questionsToShow =
                Object.keys(questions).length > 0 ? questions : dummyQuestions;
              return (
                <div
                  key={tabName}
                  onClick={() => {
                    setActiveTab(tabName);
                    scrollToCard(index);
                  }}
                  className={`w-11/12 flex-shrink-0 snap-center rounded-xl p-4 backdrop-blur-sm ${
                    activeTab === tabName ? "bg-gray-100/80" : "bg-gray-100/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold">{tabName}</h4>
                      <p className="text-xs text-gray-500">
                        {card.description}
                      </p>
                    </div>
                    {tabName === "Colleges" && (
                      <GraduationCap className="h-8 w-8 text-primary-main" />
                    )}
                    {tabName === "Exams" && (
                      <FileText className="h-8 w-8 text-primary-main" />
                    )}
                    {tabName === "Scholarships" && (
                      <Award className="h-8 w-8 text-primary-main" />
                    )}
                    {tabName === "College Predictions" && (
                      <TrendingUp className="h-8 w-8 text-primary-main" />
                    )}
                  </div>

                  {/* Sub Tabs */}
                  <div className="relative mt-4">
                    {showLeftArrow && activeTab === tabName && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -left-2 top-1/2 z-10 h-7 w-7 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          scroll("left");
                        }}
                      >
                        <ChevronLeft className="h-5 w-5 text-primary-main" />
                      </Button>
                    )}
                    <div
                      ref={activeTab === tabName ? subTabsContainerRef : null}
                      className="flex space-x-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    >
                      {card.subTabs.map((subTab: any) => (
                        <Button
                          key={subTab}
                          variant={
                            activeSubTab === subTab ? "default" : "outline"
                          }
                          size="sm"
                          className={`whitespace-nowrap rounded-md border-gray-300 px-3 text-xs transition-all ${
                            activeSubTab === subTab
                              ? "bg-gray-8 text-white hover:bg-gray-8/90"
                              : "bg-white/70 text-gray-800 hover:bg-white"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSubTab(subTab);
                            setActiveTab(tabName);
                          }}
                        >
                          {subTab}
                        </Button>
                      ))}
                    </div>
                    {showRightArrow && activeTab === tabName && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -right-2 top-1/2 z-10 h-7 w-7 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          scroll("right");
                        }}
                      >
                        <ChevronRight className="h-5 w-5 text-primary-main" />
                      </Button>
                    )}
                  </div>

                  {/* Predefined Questions */}
                  <div className="mt-2 space-y-2">
                    {loading ? (
                      <div className="flex justify-center p-4">
                        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary-main"></div>
                      </div>
                    ) : (
                      questionsToShow[tabName]?.[currentSubTab]?.map(
                        (q: string, i: number) => (
                          <div
                            key={i}
                            className="flex cursor-pointer items-center justify-between rounded-lg bg-white/80 p-2 text-xs shadow-sm hover:bg-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuestionClick(q);
                            }}
                          >
                            <span className="pr-2">{q}</span>
                            <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
                          </div>
                        )
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "chat" && (
        <div className="flex flex-1 flex-col overflow-hidden">
          <Conversation className="h-full">
            <ConversationContent className="space-y-3">
              {messages.map((message) => (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    {message.parts.map((part, index) => {
                      if (part.type === "text") {
                        return <Response key={index}>{part.text}</Response>;
                      }
                      return null;
                    })}
                  </MessageContent>
                  <MessageAvatar
                    src=""
                    name={message.role === "user" ? "U" : "AI"}
                  />
                </Message>
              ))}
              {error && (
                <Message from="assistant">
                  <MessageContent>
                    <Response>Something went wrong</Response>
                  </MessageContent>
                  <MessageAvatar src="" name="AI" />
                </Message>
              )}
              {(status === "submitted" || status === "streaming") && (
                <Message from="assistant">
                  <MessageContent>
                    <div className="flex items-center space-x-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-3"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-3 [animation-delay:100ms]"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-3 [animation-delay:200ms]"></div>
                    </div>
                  </MessageContent>
                  <MessageAvatar src="" name="AI" />
                </Message>
              )}
            </ConversationContent>
          </Conversation>
        </div>
      )}

      {/* Get Free Counselling Button */}
      {view === "questions" && (
        <div className="p-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleQuestionClick("I want counselling")}
          >
            <span className="mr-2 h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            Get Free Counselling
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div
        className={`flex-shrink-0 border-t border-gray-200/80 bg-white/60 p-3 backdrop-blur-xl ${
          !isSmallScreen ? "rounded-b-2xl" : ""
        }`}
      >
        <form onSubmit={handleFormSubmit} className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write your query on colleges, exam here..."
            disabled={status !== "ready"}
            className="w-full rounded-full border-2 border-gray-300 bg-white py-3 pl-5 pr-14 text-sm shadow-sm transition-colors focus:border-teal-500 focus:outline-none focus:ring-0"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || status !== "ready"}
            className="absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-gray-700 text-white shadow-md hover:bg-gray-800 disabled:bg-gray-300"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="mt-2 text-center text-xs text-gray-400">
          TrueScholar AI is experimental & accuracy might vary
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[119] h-12 w-12 rounded-full bg-primary-main p-0 shadow-lg hover:bg-primary-5"
        aria-label="Toggle chatbot"
      >
        {!isOpen && (
          <div className="">
            <span className="pulse-ring"></span>

            {/* Notification indicator */}
            <span className="absolute -top-0 -right-0 h-3 w-3 rounded-full bg-red-500 border-2 border-white" />

            <div className=" flex pb-1 gap-1 items-center justify-center h-6 w-6">
              <div className="eye h-3 w-4 rounded-full bg-white"></div>
              <div className="eye h-3 w-4 rounded-full bg-white"></div>
            </div>
          </div>
        )}
      </Button>

      {/* Chat Widget - Desktop */}
      {isOpen && !isSmallScreen && (
        <div className="fixed bottom-4 right-4 z-[120] flex h-[calc(100vh-6rem)] w-96 max-w-[calc(100vw-1rem)] flex-col rounded-2xl border border-gray-200/80 bg-white/90 shadow-2xl backdrop-blur-xl sm:h-[40rem]">
          {widgetContent}
        </div>
      )}

      {/* Chat Widget - Mobile Full Screen Dialog */}
      {isOpen && isSmallScreen && (
        <div className="fixed inset-0 z-[120] flex flex-col bg-white">
          {widgetContent}
        </div>
      )}
    </>
  );
}
