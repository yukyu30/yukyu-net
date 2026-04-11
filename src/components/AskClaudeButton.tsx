'use client';

import { sendGAEvent } from '@next/third-parties/google';
import { useEffect, useRef, useState } from 'react';

interface AskClaudeButtonProps {
  slug: string;
  rawMarkdown: string;
}

export default function AskClaudeButton({ slug, rawMarkdown }: AskClaudeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [claudeUrl, setClaudeUrl] = useState('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const markdownUrl = `/source/${slug}/index.md`;

  useEffect(() => {
    const absoluteMarkdownUrl = `${window.location.origin}${markdownUrl}`;
    const prompt = `以下のブログを読んで質問に答えて ${absoluteMarkdownUrl}`;
    setClaudeUrl(`https://claude.ai/new?q=${encodeURIComponent(prompt)}`);
  }, [markdownUrl]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const writeTextToClipboard = async (text: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    // Fallback for non-secure contexts where navigator.clipboard is undefined.
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    if (!ok) throw new Error('execCommand copy failed');
  };

  const handleCopyPage = async () => {
    try {
      await writeTextToClipboard(rawMarkdown);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy markdown:', err);
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const copyLabel =
    copyStatus === 'copied' ? 'COPIED' : copyStatus === 'error' ? 'ERROR' : 'Copy page';

  return (
    <div ref={dropdownRef} className="relative inline-block mt-4">
      <div className="flex">
        <button
          onClick={handleCopyPage}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-mono text-green-400 border border-green-800 rounded-l hover:bg-green-900/20 transition-colors"
        >
          <CopyIcon />
          {copyLabel}
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center px-2 py-1.5 text-sm text-green-400 border border-l-0 border-green-800 rounded-r hover:bg-green-900/20 transition-colors"
          aria-label="More options"
          aria-expanded={isOpen}
        >
          <ChevronIcon isOpen={isOpen} />
        </button>
      </div>

      {isOpen && (
        <div
          role="menu"
          className="absolute left-0 mt-2 w-80 bg-black border border-green-800 rounded shadow-lg z-50 overflow-hidden"
        >
          <button
            onClick={handleCopyPage}
            role="menuitem"
            className="flex items-start gap-3 w-full px-4 py-3 text-left hover:bg-green-900/20 transition-colors border-b border-green-900"
          >
            <span className="mt-0.5 flex-shrink-0 text-green-400">
              <CopyIcon />
            </span>
            <div className="flex-1">
              <div className="text-sm font-mono text-green-400">Copy page</div>
              <div className="text-xs font-mono text-green-700 mt-0.5">
                Copy page as Markdown for LLMs
              </div>
            </div>
          </button>

          <a
            href={markdownUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            role="menuitem"
            className="flex items-start gap-3 w-full px-4 py-3 hover:bg-green-900/20 transition-colors border-b border-green-900"
          >
            <span className="mt-0.5 flex-shrink-0 text-green-400">
              <MarkdownIcon />
            </span>
            <div className="flex-1">
              <div className="text-sm font-mono text-green-400 flex items-center gap-1">
                View as Markdown
                <ExternalIcon />
              </div>
              <div className="text-xs font-mono text-green-700 mt-0.5">
                View this page as plain text
              </div>
            </div>
          </a>

          {claudeUrl && (
            <a
              href={claudeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                sendGAEvent('event', 'ask_claude_click', {
                  slug,
                });
                setIsOpen(false);
              }}
              role="menuitem"
              className="flex items-start gap-3 w-full px-4 py-3 hover:bg-green-900/20 transition-colors"
            >
              <span className="mt-0.5 flex-shrink-0 text-green-400">
                <ClaudeIcon />
              </span>
              <div className="flex-1">
                <div className="text-sm font-mono text-green-400 flex items-center gap-1">
                  claudeに聞く
                  <ExternalIcon />
                </div>
                <div className="text-xs font-mono text-green-700 mt-0.5">
                  Ask questions about this page
                </div>
              </div>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function CopyIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function MarkdownIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
      <path d="M6 15V9l3 3 3-3v6" />
      <path d="M16 9v6" />
      <path d="M13 12l3 3 3-3" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function ClaudeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z" />
      <path d="M19 3l.6 2.4L22 6l-2.4.6L19 9l-.6-2.4L16 6l2.4-.6L19 3z" opacity="0.6" />
    </svg>
  );
}
