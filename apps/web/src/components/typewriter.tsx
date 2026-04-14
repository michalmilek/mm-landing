import { useEffect, useState } from "react";
import { cn } from "@mm-landing/ui/lib/utils";

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
}

export function Typewriter({
  text,
  speed = 50,
  delay = 0,
  className,
  onComplete,
}: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const delayTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(delayTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) {
      return;
    }

    if (displayedText.length < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, speed);
      return () => clearTimeout(timer);
    }

    onComplete?.();
  }, [displayedText, started, text, speed, onComplete]);

  return (
    <span className={cn("font-mono", className)}>
      {displayedText}
      {displayedText.length < text.length && (
        <span className="inline-block w-2 h-4 bg-matrix animate-pulse align-middle ml-0.5" />
      )}
    </span>
  );
}
