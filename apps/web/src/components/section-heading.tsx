import { cn } from "@mm-landing/ui/lib/utils";

interface SectionHeadingProps {
  command: string;
  className?: string;
}

export function SectionHeading({ command, className }: SectionHeadingProps) {
  return (
    <h2
      className={cn(
        "font-mono text-xl md:text-2xl font-bold text-matrix text-glow mb-6",
        className,
      )}
    >
      <span className="text-matrix/60">&gt; </span>
      {command}
      <span className="ml-1 inline-block w-2.5 h-5 bg-matrix animate-pulse align-middle" />
    </h2>
  );
}
