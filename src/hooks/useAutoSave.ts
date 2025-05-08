import { useEffect, useRef } from "react";
import { debounce } from "@/lib/utils";

type SaveFunction = (title: string, content: string, silent?: boolean) => void;

export function useAutoSave(
  title: string,
  content: string,
  saveFunction: SaveFunction,
  delay: number = 2000
) {
  // Keep track of whether the note has been modified
  const initialRender = useRef(true);
  const titleRef = useRef(title);
  const contentRef = useRef(content);
  
  // Create a debounced version of the save function to prevent too many saves
  const debouncedSave = useRef(
    debounce((title: string, content: string) => {
      saveFunction(title, content, true); // Pass true for silent auto-saving
    }, delay)
  ).current;
  
  // Update refs when props change
  useEffect(() => {
    titleRef.current = title;
    contentRef.current = content;
  }, [title, content]);

  // Auto-save when title or content changes
  useEffect(() => {
    // Skip the first render to avoid saving unmodified notes
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    
    // Always save when content or title changes to ensure auto-generated titles are saved
    console.log("Auto-saving note with title:", title);
    debouncedSave(title, content);
    
  }, [title, content, debouncedSave]);

  return null; // This hook doesn't return anything
} 