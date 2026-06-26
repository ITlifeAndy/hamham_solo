import React from 'react';
import { BookmarkItem } from './BookmarkItem';

interface MoodboardGalleryProps {
  bookmarks: { title: string; url: string; iconUrl?: string; isFavorite?: boolean }[];
}

export const MoodboardGallery: React.FC<MoodboardGalleryProps> = ({ bookmarks }) => {
  return (
    <div className="grid grid-cols-2 gap-2 h-full overflow-y-auto pr-2 custom-scrollbar">
      {bookmarks.length > 0 ? (
        bookmarks.map((bm, idx) => (
          <BookmarkItem key={idx} {...bm} mode="moodboard" />
        ))
      ) : (
        // Placeholders to match design
        [1, 2].map((i) => (
          <div key={i} className="aspect-square bg-surface-container rounded-xl border border-border-ring flex items-center justify-center text-outline">
            <span className="material-symbols-outlined">image</span>
          </div>
        ))
      )}
    </div>
  );
};
