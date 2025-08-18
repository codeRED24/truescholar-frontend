"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SuggestionInputProps {
  fetchSuggestions?: (query: string) => Promise<string[]>;
  suggestions?: string[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (suggestion: string) => void;
  className?: string;
  minQueryLength?: number;
  debounceMs?: number;
}

export function SuggestionInput({
  fetchSuggestions,
  suggestions = [],
  placeholder = "Type to search...",
  value = "",
  onChange,
  onSelect,
  className,
  minQueryLength = 1,
  debounceMs = 300,
}: SuggestionInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [apiSuggestions, setApiSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const currentSuggestions = fetchSuggestions ? apiSuggestions : suggestions;

  const filteredSuggestions = currentSuggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(inputValue.toLowerCase())
  );

  const fetchApiSuggestions = async (query: string) => {
    if (!fetchSuggestions || query.length < minQueryLength) {
      setApiSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await fetchSuggestions(query);
      setApiSuggestions(results);
      setIsOpen(results.length > 0);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch suggestions"
      );
      setApiSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
    setHighlightedIndex(-1);

    if (fetchSuggestions) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        fetchApiSuggestions(newValue);
      }, debounceMs);
    } else {
      setIsOpen(newValue.length > 0 && filteredSuggestions.length > 0);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    onChange?.(suggestion);
    onSelect?.(suggestion);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Update input value when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (
            inputValue.length >= minQueryLength &&
            filteredSuggestions.length > 0
          ) {
            setIsOpen(true);
          }
        }}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />

      {isLoading && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover p-3 text-center text-sm text-muted-foreground shadow-md">
          Loading suggestions...
        </div>
      )}

      {error && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-destructive/10 p-3 text-center text-sm text-destructive shadow-md">
          {error}
        </div>
      )}

      {isOpen && !isLoading && !error && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                "cursor-pointer px-3 py-2 text-sm bg-white hover:bg-accent hover:text-accent-foreground",
                index === highlightedIndex && "bg-accent text-accent-foreground"
              )}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}

      {isOpen &&
        !isLoading &&
        !error &&
        inputValue.length >= minQueryLength &&
        filteredSuggestions.length === 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover p-3 text-center text-sm text-muted-foreground shadow-md">
            No suggestions found
          </div>
        )}
    </div>
  );
}
