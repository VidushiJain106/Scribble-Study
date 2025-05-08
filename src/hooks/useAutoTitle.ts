import { useEffect, useState } from "react";

/**
 * Hook that automatically generates a title from the note content
 * @param content The note content
 * @param existingTitle The current title (used to check if we should replace it)
 * @param setTitle Function to update the title
 */
export function useAutoTitle(
  content: string,
  existingTitle: string,
  setTitle: (title: string) => void
) {
  const [hasGeneratedTitle, setHasGeneratedTitle] = useState(false);
  
  useEffect(() => {
    // Skip if we've already generated a title or if the title has been 
    // manually edited (not the default "Untitled Note")
    if (hasGeneratedTitle || (existingTitle && existingTitle !== "Untitled Note")) {
      return;
    }
    
    // Only generate a title if we have meaningful content
    if (content.trim().length >= 10) {
      // Generate title based on first line or first few words
      let newTitle = "";
      
      // Try to use the first line if it exists and isn't too long
      const firstLine = content.split("\n")[0].trim();
      if (firstLine && firstLine.length >= 3 && firstLine.length <= 60) {
        newTitle = firstLine;
      } else {
        // Otherwise use the first few words (up to 6)
        const words = content.trim().split(/\s+/);
        const titleWords = words.slice(0, 6).join(" ");
        
        // If the title would be too long, truncate it
        newTitle = titleWords.length > 60 
          ? titleWords.substring(0, 57) + "..."
          : titleWords;
      }
      
      // Update the title if we generated something meaningful
      if (newTitle) {
        setTitle(newTitle);
        setHasGeneratedTitle(true);
      }
    }
  }, [content, existingTitle, setTitle, hasGeneratedTitle]);
  
  return { hasGeneratedTitle };
} 