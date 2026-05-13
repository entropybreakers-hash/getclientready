import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  children: string;
  className?: string;
}

export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div
      className={cn(
        "prose-content text-ink-light/85 leading-[1.75]",
        "[&_h1]:font-serif [&_h1]:text-3xl [&_h1]:md:text-4xl [&_h1]:font-medium [&_h1]:text-ink-light [&_h1]:mt-8 [&_h1]:mb-4",
        "[&_h2]:font-serif [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:font-medium [&_h2]:text-ink-light [&_h2]:mt-7 [&_h2]:mb-3",
        "[&_h3]:font-serif [&_h3]:text-xl [&_h3]:md:text-2xl [&_h3]:font-medium [&_h3]:text-ink-light [&_h3]:mt-6 [&_h3]:mb-3",
        "[&_p]:mb-4 [&_p]:last:mb-0",
        "[&_strong]:text-ink-light [&_strong]:font-semibold",
        "[&_em]:text-accent [&_em]:italic",
        "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-1.5",
        "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol]:space-y-1.5",
        "[&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-ink-light/75",
        "[&_code]:bg-white/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm",
        className,
      )}
    >
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
