import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface Section {
  fullTitle: string; // e.g., "Section 1: Colonial America (1607–1754)"
  name: string; // e.g., "Colonial America"
  dateRange?: string; // e.g., "1607–1754"
  keyPoints: string[]; // bullet list without leading hyphens
  summary: string; // plain text summary
}

interface ModuleData {
  heading?: string; // first level heading (e.g., `# AP U.S. History Module for 12th Grade`)
  moduleTitle?: string; // second level heading (e.g., `## Module Title: ...`)
  sections: Section[];
}

const parseModuleContent = (markdown: string): ModuleData => {
  const lines = markdown.split(/\r?\n/);
  const headingLine = lines.find((l) => l.startsWith("# "))?.replace(/^#\s*/, "");
  const moduleTitleLine = lines.find((l) => l.startsWith("## "))?.replace(/^##\s*/, "");

  const sectionRegex = /###\s+Section\s+\d+:\s+([^\n]+)\n####\s+Key Points:\n([\s\S]*?)\n####\s+Summary:\n([\s\S]*?)(?:\n---|$)/g;
  const sections: Section[] = [];

  let match: RegExpExecArray | null;
  while ((match = sectionRegex.exec(markdown)) !== null) {
    const [_, sectionTitleRaw, keyPointsBlock, summaryBlock] = match;

    // Extract name and date range if present (parentheses at end)
    const dateMatch = sectionTitleRaw.match(/\(([^)]+)\)$/);
    const dateRange = dateMatch ? dateMatch[1] : undefined;
    const name = sectionTitleRaw.replace(/\s*\([^)]*\)$/, "").trim();

    // Parse key points: lines that start with hyphen or *
    const keyPoints = keyPointsBlock
      .split(/\r?\n/)
      .map((l) => l.trim().replace(/^[-*•–]\s*/, ""))
      .filter((l) => l.length > 0);

    const summary = summaryBlock.trim();

    sections.push({
      fullTitle: sectionTitleRaw.trim(),
      name,
      dateRange,
      keyPoints,
      summary,
    });
  }

  return {
    heading: headingLine,
    moduleTitle: moduleTitleLine,
    sections,
  };
};

interface ModuleViewerProps {
  content: string;
}

export default function ModuleViewer({ content }: ModuleViewerProps) {
  const { heading, moduleTitle, sections } = useMemo(
    () => parseModuleContent(content),
    [content]
  );

  const [index, setIndex] = useState(0);
  const total = sections.length;
  const current = sections[index];

  if (!total) {
    return (
      <div className="p-4 border rounded-md bg-muted/20 text-sm text-muted-foreground">
        No module sections detected.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {heading && <h2 className="text-2xl font-bold">{heading}</h2>}
      {moduleTitle && <h3 className="text-xl font-semibold">{moduleTitle}</h3>}

      {/* Progress indicator */}
      <div className="space-y-2">
        <Progress value={((index + 1) / total) * 100} />
        <div className="text-sm text-muted-foreground">
          Step {index + 1} of {total}
        </div>
      </div>

      {/* Jump to section */}
      <div className="flex items-center gap-2">
        <span className="text-sm whitespace-nowrap">Jump to Section:</span>
        <Select
          value={String(index)}
          onValueChange={(val) => setIndex(parseInt(val, 10))}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select section" />
          </SelectTrigger>
          <SelectContent>
            {sections.map((s, i) => (
              <SelectItem key={i} value={String(i)}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Section display */}
      <section className="space-y-4 border rounded-md p-4 bg-muted/20">
        <h4 className="text-lg font-semibold">
          {current.name}
          {current.dateRange && (
            <span className="text-muted-foreground font-normal"> (
              {current.dateRange})
            </span>
          )}
        </h4>

        <Accordion
          type="multiple"
          className="w-full"
          defaultValue={["keypoints", "summary"]}
        >
          <AccordionItem value="keypoints">
            <AccordionTrigger>Key Points</AccordionTrigger>
            <AccordionContent>
              {current.keyPoints.length ? (
                <ul className="list-disc pl-6 space-y-1">
                  {current.keyPoints.map((kp, idx) => (
                    <li key={idx}>{kp}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No key points.</p>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="summary">
            <AccordionTrigger>Summary</AccordionTrigger>
            <AccordionContent>
              {current.summary ? (
                <p className="leading-relaxed whitespace-pre-wrap">
                  {current.summary}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">No summary.</p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
          >
            Previous
          </Button>
          <Button
            disabled={index === total - 1}
            onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
          >
            Next
          </Button>
        </div>
      </section>
    </div>
  );
} 