'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

interface TagItem {
  tag: string;
  count: number;
}

interface TagCloudProps {
  tags: TagItem[];
  selectedTag?: string;
  allPostsLabel: string;
}

export function TagCloud({ tags, selectedTag, allPostsLabel }: TagCloudProps) {
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);
  const router = useRouter();
  const locale = useLocale();

  const maxCount = Math.max(...tags.map((t) => t.count), 1);

  // Scale font size between 13px and 22px based on count
  const getFontSize = (count: number) => {
    const min = 13;
    const max = 22;
    return min + ((count / maxCount) * (max - min));
  };

  const handleSelect = (tag: string | null) => {
    if (tag) {
      router.push(`/${locale}/blog?tag=${encodeURIComponent(tag)}`);
    } else {
      router.push(`/${locale}/blog`);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
        {/* All Posts */}
        <button
          onClick={() => handleSelect(null)}
          className={`relative px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
            !selectedTag
              ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
              : 'border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
          }`}
        >
          {allPostsLabel}
        </button>

        {tags.map(({ tag, count }) => {
          const isSelected = selectedTag === tag;
          const isHovered = hoveredTag === tag;
          const fontSize = getFontSize(count);

          return (
            <div key={tag} className="relative">
              <button
                onClick={() => handleSelect(tag)}
                onMouseEnter={() => setHoveredTag(tag)}
                onMouseLeave={() => setHoveredTag(null)}
                style={{ fontSize: `${fontSize}px` }}
                className={`relative font-medium transition-all duration-200 leading-none
                  ${isSelected
                    ? 'text-emerald-400 scale-110'
                    : isHovered
                    ? 'text-white scale-110'
                    : 'text-white/50 hover:text-white'
                  }`}
              >
                {tag}
                {/* Glow backdrop on hover */}
                {isHovered && (
                  <span className="absolute inset-0 -m-1.5 rounded-lg bg-emerald-500/10 -z-10" />
                )}
              </button>

              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                  <div className="bg-slate-900 border border-white/15 text-white text-xs font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap shadow-xl">
                    {count} {count === 1 ? 'article' : 'articles'}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
