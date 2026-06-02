import { useEffect, useRef } from "react";
import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";
import "highlight.js/styles/atom-one-dark.min.css";

hljs.registerLanguage("python", python);

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  /** Max height of the scrollable code area, in px. Keeps long snippets from
   *  stretching the layout taller than the panel beside them. */
  maxHeight?: number;
}

export function CodeBlock({
  code,
  language = "python",
  filename,
  maxHeight,
}: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.removeAttribute("data-highlighted");
      hljs.highlightElement(codeRef.current);
    }
  }, [code, language]);

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-xl border border-[rgba(22,26,35,0.4)] shadow-[0_2px_4px_rgba(13,43,72,0.06),0_12px_32px_rgba(20,147,220,0.12)]"
      style={{ background: "#282c34" }}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-white/5 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          </div>
          {filename && (
            <span className="font-mono text-[11.5px] text-white/60">{filename}</span>
          )}
        </div>
      </div>
      <pre
        className="flex-1 overflow-auto p-4 text-[13px] leading-[1.75]"
        style={maxHeight ? { maxHeight } : undefined}
      >
        <code ref={codeRef} className={`language-${language}`}>
          {code}
        </code>
      </pre>
    </div>
  );
}
