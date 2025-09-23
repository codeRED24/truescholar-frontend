"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const ChatbotWidget = dynamic(() => import("./ChatbotWidget"), {
  ssr: false,
});

interface ChatbotWrapperProps {
  cardConfig: any;
}

export default function ChatbotWrapper({ cardConfig }: ChatbotWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChatbot = () => {
    console.log("Toggle chatbot clicked, current isOpen:", isOpen);
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <Button
        onClick={toggleChatbot}
        className="fixed bottom-6 right-6 z-[119] h-12 w-12 rounded-full bg-primary-main p-0 shadow-lg hover:bg-primary-5"
        aria-label="Toggle chatbot"
      >
        <div className="">
          <span className="pulse-ring"></span>

          {/* Notification indicator */}
          <span className="absolute -top-0 -right-0 h-3 w-3 rounded-full bg-red-500 border-2 border-white" />

          <div className=" flex pb-1 gap-1 items-center justify-center h-6 w-6">
            <div className="eye h-3 w-4 rounded-full bg-white"></div>
            <div className="eye h-3 w-4 rounded-full bg-white"></div>
          </div>
        </div>
      </Button>

      {/* Render ChatbotWidget only when isOpen is true */}
      {isOpen && (
        <ChatbotWidget
          cardConfig={cardConfig}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
