"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "@/types";
import { toast } from "sonner";

interface Props {
  message: Message;
  isStreaming?: boolean;
}

export default function ChatMessage({ message, isStreaming }: Props) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex justify-end items-start gap-3">
        <div className="max-w-[78%] flex flex-col items-end">
          <div className="bg-[#f4f2fd] px-5 py-3 rounded-2xl rounded-tr-none text-[#1a1b22] shadow-sm">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
          <span className="text-[10px] text-stone-400 mt-1.5 font-medium uppercase tracking-widest px-1">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      {/* AI Avatar */}
      <div className="flex-shrink-0 relative">
        <div
          className={`w-9 h-9 bg-[#634629] rounded-xl flex items-center justify-center text-white shadow-md ring-4 ring-[#ffdcbf]/30 ${
            isStreaming ? "donkey-pulse" : ""
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">smart_toy</span>
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="min-h-[20px]">
          {message.content ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-base font-bold text-[#1a1b22] mt-3 mb-1 first:mt-0">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-sm font-bold text-[#1a1b22] mt-3 mb-1 first:mt-0">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-semibold text-[#1a1b22] mt-2 mb-1 first:mt-0">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="text-sm leading-relaxed text-[#1a1b22] mb-2 last:mb-0">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-outside text-sm text-[#1a1b22] space-y-1 mb-2 pl-4">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-outside text-sm text-[#1a1b22] space-y-1 mb-2 pl-4">{children}</ol>
                ),
                li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
                code: ({ className, children, ...props }) => {
                  const isBlock = className?.startsWith("language-");
                  return isBlock ? (
                    <pre className="bg-[#1a1b22] text-[#f4f2fd] p-3 rounded-xl text-xs font-mono overflow-x-auto mb-2 mt-1">
                      <code>{children}</code>
                    </pre>
                  ) : (
                    <code className="bg-[#e8e7f1] text-[#634629] px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                      {children}
                    </code>
                  );
                },
                strong: ({ children }) => <strong className="font-semibold text-[#1a1b22]">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-[#634629]/30 pl-3 text-stone-500 italic my-2">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-2">
                    <table className="text-xs w-full border-collapse">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="text-left px-2 py-1.5 bg-[#e8e7f1] font-semibold text-[#1a1b22] border border-[#d3c4b9]/30">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-2 py-1.5 border border-[#d3c4b9]/30 text-[#1a1b22]">{children}</td>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          ) : null}
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-[#634629] ml-0.5 animate-pulse rounded-sm align-middle" />
          )}
        </div>

        {!isStreaming && message.content && (
          <div className="flex items-center justify-end pt-1">
            <button
              onClick={handleCopy}
              className="p-1.5 text-stone-400 hover:text-[#634629] transition-colors"
              title="Copy response"
            >
              <span className="material-symbols-outlined text-sm">
                {copied ? "check" : "content_copy"}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
