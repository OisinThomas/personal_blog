'use client';

import { useState } from 'react';
import { blockActionPrompts } from '@/lib/ai/prompts';
import {
  Pencil,
  Maximize2,
  Minimize2,
  Check,
  Shrink,
  Briefcase,
  Smile,
  Languages,
  Loader2,
} from 'lucide-react';

interface AIBlockMenuProps {
  position: { x: number; y: number };
  nodeKey: string;
  nodeText: string;
  postLanguage: string;
  onAction: (action: string, nodeKey: string, nodeText: string) => Promise<void>;
  onOpenInChat: (prompt: string) => void;
  onClose: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  pencil: <Pencil className="w-3.5 h-3.5" />,
  expand: <Maximize2 className="w-3.5 h-3.5" />,
  minimize: <Minimize2 className="w-3.5 h-3.5" />,
  check: <Check className="w-3.5 h-3.5" />,
  shrink: <Shrink className="w-3.5 h-3.5" />,
  briefcase: <Briefcase className="w-3.5 h-3.5" />,
  smile: <Smile className="w-3.5 h-3.5" />,
  languages: <Languages className="w-3.5 h-3.5" />,
};

export default function AIBlockMenu({
  position,
  nodeKey,
  nodeText,
  postLanguage,
  onAction,
  onOpenInChat,
  onClose,
}: AIBlockMenuProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Filter translation options based on post language
  const items = blockActionPrompts.filter((item) => {
    if (item.action === 'translate_ga' && postLanguage === 'ga') return false;
    if (item.action === 'translate_en' && postLanguage === 'en') return false;
    return true;
  });

  const handleAction = async (action: string) => {
    setLoadingAction(action);
    try {
      await onAction(action, nodeKey, nodeText);
    } finally {
      setLoadingAction(null);
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Menu */}
      <div
        className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 min-w-[180px]"
        style={{
          left: Math.min(position.x, window.innerWidth - 200),
          top: Math.min(position.y, window.innerHeight - 400),
        }}
      >
        <div className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
          AI Actions
        </div>
        {items.map((item) => (
          <button
            key={item.action}
            onClick={() => handleAction(item.action)}
            disabled={loadingAction !== null}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {loadingAction === item.action ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              iconMap[item.icon] || null
            )}
            <span>{item.label}</span>
          </button>
        ))}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
          <button
            onClick={() => {
              onOpenInChat(`Improve this text:\n\n"${nodeText.slice(0, 200)}${nodeText.length > 200 ? '...' : ''}"`);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-xs">💬</span>
            <span>Open in Chat</span>
          </button>
        </div>
      </div>
    </>
  );
}
