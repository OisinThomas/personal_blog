'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Heading1, Heading2, Heading3, List, ListOrdered, Quote, AlertCircle,
  ChevronRight, Code, Minus, Table, ImageIcon, Video, Globe, Languages,
  Superscript,
} from 'lucide-react';

export interface SlashCommandItem {
  title: string;
  icon: React.ReactNode;
  category: string;
  keywords: string[];
  onSelect: () => void;
}

interface SlashCommandMenuProps {
  items: SlashCommandItem[];
  anchorRect: DOMRect | null;
  onClose: () => void;
  filter: string;
}

export default function SlashCommandMenu({
  items,
  anchorRect,
  onClose,
  filter,
}: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredItems = items.filter((item) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.keywords.some((k) => k.includes(q))
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [filter]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].onSelect();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredItems, selectedIndex, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    const el = menuRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!anchorRect || filteredItems.length === 0) return null;

  const top = anchorRect.bottom + 4;
  const left = anchorRect.left;

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-50 w-64 max-h-80 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1"
      style={{ top, left }}
    >
      {filteredItems.map((item, index) => (
        <button
          key={item.title}
          data-index={index}
          onClick={item.onSelect}
          onMouseEnter={() => setSelectedIndex(index)}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors ${
            index === selectedIndex
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }`}
        >
          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400">
            {item.icon}
          </span>
          <span>{item.title}</span>
          <span className="ml-auto text-xs text-gray-400">{item.category}</span>
        </button>
      ))}
    </div>,
    document.body
  );
}

export function getSlashCommandItems(callbacks: {
  onHeading: (level: 1 | 2 | 3) => void;
  onBulletList: () => void;
  onNumberedList: () => void;
  onQuote: () => void;
  onCallout: () => void;
  onToggle: () => void;
  onCodeBlock: () => void;
  onDivider: () => void;
  onTable: () => void;
  onImage: () => void;
  onVideo: () => void;
  onEmbed: () => void;
  onBilingual: () => void;
  onFootnote: () => void;
}): SlashCommandItem[] {
  return [
    {
      title: 'Heading 1',
      icon: <Heading1 className="w-4 h-4" />,
      category: 'Text',
      keywords: ['h1', 'title', 'heading'],
      onSelect: () => callbacks.onHeading(1),
    },
    {
      title: 'Heading 2',
      icon: <Heading2 className="w-4 h-4" />,
      category: 'Text',
      keywords: ['h2', 'subtitle', 'heading'],
      onSelect: () => callbacks.onHeading(2),
    },
    {
      title: 'Heading 3',
      icon: <Heading3 className="w-4 h-4" />,
      category: 'Text',
      keywords: ['h3', 'heading'],
      onSelect: () => callbacks.onHeading(3),
    },
    {
      title: 'Bullet List',
      icon: <List className="w-4 h-4" />,
      category: 'Text',
      keywords: ['ul', 'unordered', 'bullet'],
      onSelect: callbacks.onBulletList,
    },
    {
      title: 'Numbered List',
      icon: <ListOrdered className="w-4 h-4" />,
      category: 'Text',
      keywords: ['ol', 'ordered', 'number'],
      onSelect: callbacks.onNumberedList,
    },
    {
      title: 'Quote',
      icon: <Quote className="w-4 h-4" />,
      category: 'Structure',
      keywords: ['blockquote', 'quote'],
      onSelect: callbacks.onQuote,
    },
    {
      title: 'Callout',
      icon: <AlertCircle className="w-4 h-4" />,
      category: 'Structure',
      keywords: ['callout', 'info', 'warning', 'note'],
      onSelect: callbacks.onCallout,
    },
    {
      title: 'Toggle',
      icon: <ChevronRight className="w-4 h-4" />,
      category: 'Structure',
      keywords: ['toggle', 'details', 'collapsible', 'accordion'],
      onSelect: callbacks.onToggle,
    },
    {
      title: 'Code Block',
      icon: <Code className="w-4 h-4" />,
      category: 'Structure',
      keywords: ['code', 'pre', 'snippet'],
      onSelect: callbacks.onCodeBlock,
    },
    {
      title: 'Divider',
      icon: <Minus className="w-4 h-4" />,
      category: 'Structure',
      keywords: ['hr', 'divider', 'separator', 'line'],
      onSelect: callbacks.onDivider,
    },
    {
      title: 'Table',
      icon: <Table className="w-4 h-4" />,
      category: 'Structure',
      keywords: ['table', 'grid'],
      onSelect: callbacks.onTable,
    },
    {
      title: 'Image',
      icon: <ImageIcon className="w-4 h-4" />,
      category: 'Media',
      keywords: ['image', 'photo', 'picture', 'img'],
      onSelect: callbacks.onImage,
    },
    {
      title: 'Video',
      icon: <Video className="w-4 h-4" />,
      category: 'Media',
      keywords: ['video', 'youtube', 'vimeo'],
      onSelect: callbacks.onVideo,
    },
    {
      title: 'Embed',
      icon: <Globe className="w-4 h-4" />,
      category: 'Media',
      keywords: ['embed', 'iframe', 'widget'],
      onSelect: callbacks.onEmbed,
    },
    {
      title: 'Bilingual',
      icon: <Languages className="w-4 h-4" />,
      category: 'Translation',
      keywords: ['bilingual', 'english', 'irish', 'language', 'translation'],
      onSelect: callbacks.onBilingual,
    },
    {
      title: 'Footnote',
      icon: <Superscript className="w-4 h-4" />,
      category: 'Structure',
      keywords: ['footnote', 'reference', 'note', 'citation', 'superscript'],
      onSelect: callbacks.onFootnote,
    },
  ];
}
