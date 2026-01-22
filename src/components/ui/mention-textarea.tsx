import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import getCaretCoordinates from "textarea-caret";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface MentionSuggestion {
  id: string;
  handle: string;
  displayName: string;
  image?: string;
  entityType?: string;
  entityId?: string;
}

interface MentionTextareaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onChange"
> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  suggestions: MentionSuggestion[];
  onSearch: (query: string) => void;
}

export function MentionTextarea({
  value,
  onChange,
  suggestions,
  onSearch,
  className,
  ...props
}: MentionTextareaProps) {
  const commandRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [matchStart, setMatchStart] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isSelectingRef = useRef(false);
  // Store stable references for click handlers
  const matchStartRef = useRef<number | null>(null);
  const valueRef = useRef(value);

  // Keep refs in sync
  useEffect(() => {
    matchStartRef.current = matchStart;
  }, [matchStart]);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Reset selection when suggestions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e);
    checkTrigger(e.target);
  };

  const checkTrigger = (el: HTMLTextAreaElement) => {
    const cursor = el.selectionEnd;
    const textBeforeCursor = el.value.slice(0, cursor);

    const lastAt = textBeforeCursor.lastIndexOf("@");
    if (lastAt !== -1) {
      // Check if @ is preceded by space or newline or start
      const charBefore = lastAt > 0 ? textBeforeCursor[lastAt - 1] : " ";
      if (/\s/.test(charBefore)) {
        const potentialQuery = textBeforeCursor.slice(lastAt + 1);
        // Ensure no spaces in query (handles standard mentions)
        if (!/\s/.test(potentialQuery)) {
          setMatchStart(lastAt);
          const caret = getCaretCoordinates(el, lastAt);
          const rect = el.getBoundingClientRect();
          setCoords({
            top: rect.top + caret.top - el.scrollTop + 24,
            left: rect.left + caret.left,
          });
          setIsOpen(true);
          onSearch(potentialQuery);
          return;
        }
      }
    }

    setIsOpen(false);
    onSearch("");
  };

  const insertMention = (suggestion: MentionSuggestion) => {
    const currentMatchStart = matchStartRef.current;
    const currentValue = valueRef.current;
    // Query DOM directly as refs are unreliable in portal click handlers
    const el = document.querySelector(
      "[data-mention-textarea]",
    ) as HTMLTextAreaElement;

    if (currentMatchStart === null || !el) return;

    const before = currentValue.slice(0, currentMatchStart);
    const after = currentValue.slice(el.selectionEnd || currentValue.length);
    const mentionText = `@${suggestion.handle} `;
    const newValue = before + mentionText + after;

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value",
    )?.set;

    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(el, newValue);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      const event = {
        target: { value: newValue },
      } as React.ChangeEvent<HTMLTextAreaElement>;
      onChange(event);
    }

    setIsOpen(false);
    setMatchStart(null);
    matchStartRef.current = null;

    // Restore focus and cursor position
    requestAnimationFrame(() => {
      el.focus();
      const newCursorPos = currentMatchStart + mentionText.length;
      el.setSelectionRange(newCursorPos, newCursorPos);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) => (prev - 1 + suggestions.length) % suggestions.length,
      );
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      insertMention(suggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const handleBlur = () => {
    // Delay closing to allow click on suggestion to register
    setTimeout(() => {
      if (!isSelectingRef.current) {
        setIsOpen(false);
        onSearch("");
      }
    }, 150);
  };

  return (
    <div className="relative w-full">
      <Textarea
        data-mention-textarea
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onClick={(e) => checkTrigger(e.currentTarget)}
        onBlur={handleBlur}
        className={className}
        {...props}
      />
      {isOpen &&
        suggestions.length > 0 &&
        createPortal(
          <div
            ref={commandRef}
            className="fixed w-64 rounded-md border bg-popover text-popover-foreground shadow-lg outline-none animate-in fade-in-0 zoom-in-95"
            style={{
              top: coords.top,
              left: coords.left,
              zIndex: 2147483647,
              pointerEvents: "auto",
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              const item = target.closest(
                "[data-suggestion-index]",
              ) as HTMLElement;
              if (item) {
                const index = parseInt(item.dataset.suggestionIndex || "0", 10);
                const suggestion = suggestions[index];
                if (suggestion) {
                  isSelectingRef.current = true;
                  insertMention(suggestion);
                  setTimeout(() => {
                    isSelectingRef.current = false;
                  }, 100);
                }
              }
            }}
          >
            <div className="max-h-[300px] overflow-y-auto p-1">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  data-suggestion-index={index}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer rounded-sm px-2 py-1.5 text-sm w-full text-left select-none",
                    "hover:bg-accent hover:text-accent-foreground",
                    index === selectedIndex &&
                      "bg-accent text-accent-foreground",
                  )}
                >
                  <Avatar className="h-6 w-6 shrink-0 pointer-events-none">
                    <AvatarImage src={suggestion.image} />
                    <AvatarFallback>
                      {suggestion.displayName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-left min-w-0 flex-1 pointer-events-none">
                    <span className="font-medium text-sm truncate">
                      {suggestion.displayName}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      @{suggestion.handle}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
