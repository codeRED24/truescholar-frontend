"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Send } from "lucide-react";
import { Conversation, ConversationContent } from "@/components/conversation";
import { Message, MessageContent, MessageAvatar } from "@/components/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputSubmit,
} from "@/components/prompt-input";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Response } from "@/components/response";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const [input, setInput] = useState("");

  // Display welcome message only in UI, don't add to messages array
  // This prevents message alternation errors while still showing a helpful greeting
  const showWelcomeMessage = messages.length === 0;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== "ready") return;

    // Send message with custom body data
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-[120] h-12 w-12 rounded-full bg-primary-main p-0 shadow-lg hover:bg-primary-5"
        aria-label="Toggle chatbot"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </Button>

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-[119] flex h-96 w-80 max-w-[calc(100vw-2rem)] flex-col rounded-lg border border-gray-3 bg-background shadow-xl sm:h-[32rem] sm:w-96">
          {/* Header */}
          <div className="flex-shrink-0 rounded-t-lg bg-primary-main p-4 text-white">
            <h3 className="text-sm font-semibold">TrueScholar Assistant</h3>
            <p className="text-xs opacity-90">
              Ask me about Indian colleges, exams etc.
            </p>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-hidden">
            <Conversation className="h-full">
              <ConversationContent className="space-y-3">
                {/* Show welcome message when no conversation history */}
                {showWelcomeMessage && (
                  <Message from="assistant">
                    <MessageContent>
                      <Response>
                        Hello! I'm here to help you find the perfect college in
                        India. How can I assist you today?
                      </Response>
                    </MessageContent>
                    <MessageAvatar src="" name="AI" />
                  </Message>
                )}

                {messages.map((message) => (
                  <Message key={message.id} from={message.role}>
                    <MessageContent>
                      {/* Render text parts with proper markdown formatting */}
                      {message.parts.map((part, index) => {
                        if (part.type === "text") {
                          return <Response key={index}>{part.text}</Response>;
                        }
                        return null;
                      })}

                      {/* Render sources if available - COMMENTED OUT FOR NOW */}
                      {/* {message.parts.filter(
                        (part) =>
                          part.type === "source-url" ||
                          part.type === "source-document"
                      ).length > 0 && 
                      (
                        <Sources className="mt-3">
                          <SourcesTrigger
                            count={
                              message.parts.filter(
                                (part) =>
                                  part.type === "source-url" ||
                                  part.type === "source-document"
                              ).length
                            }
                          />
                          <SourcesContent>
                            {message.parts
                              .filter((part) => part.type === "source-url")
                              .map((part, sourceIndex) => (
                                <Source
                                  key={`source-url-${sourceIndex}`}
                                  href={part.url}
                                  title={
                                    part.title || new URL(part.url).hostname
                                  }
                                />
                              ))}
                            {message.parts
                              .filter((part) => part.type === "source-document")
                              .map((part, sourceIndex) => (
                                <Source
                                  key={`source-doc-${sourceIndex}`}
                                  href="#"
                                  title={
                                    part.title || `Document ${sourceIndex + 1}`
                                  }
                                />
                              ))}
                          </SourcesContent>
                        </Sources>
                      )
                      } */}
                    </MessageContent>
                    <MessageAvatar
                      src=""
                      name={message.role === "user" ? "U" : "AI"}
                    />
                  </Message>
                ))}
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

          {/* Input Area */}
          <div className="flex-shrink-0  border-t border-gray-3 p-3 sm:p-4">
            <PromptInput onSubmit={handleFormSubmit}>
              <PromptInputTextarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about universities, courses, requirements..."
                disabled={status !== "ready"}
                className="min-h-[48px] text-sm focus:ring-0"
              />
              <PromptInputToolbar>
                <div></div>
                <PromptInputSubmit
                  disabled={!input.trim() || status !== "ready"}
                  status={
                    status === "submitted" || status === "streaming"
                      ? "submitted"
                      : undefined
                  }
                  className="bg-primary-main hover:bg-primary-main/90"
                >
                  <Send className="h-4 w-4" />
                </PromptInputSubmit>
              </PromptInputToolbar>
            </PromptInput>
            {error && (
              <div className="mt-2 text-xs text-gray-7">
                Error: {error.message}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
