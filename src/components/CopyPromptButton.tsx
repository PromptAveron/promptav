import { useState } from 'react';

export function CopyPromptButton({ text, label = 'Copy Prompt' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyError(false);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopyError(true);
    }
  };

  return (
    <>
      <button type="button" onClick={handleCopy} className="btn-primary flex-1">
        {copied ? 'Copied!' : label}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? 'Prompt copied to clipboard.' : copyError ? 'Clipboard access failed. Select the prompt text and copy it manually.' : ''}
      </span>
    </>
  );
}
