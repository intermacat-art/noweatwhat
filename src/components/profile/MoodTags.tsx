import { MOOD_TAG_OPTIONS } from '../../data/types';

interface MoodTagsProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export default function MoodTags({ selected, onChange }: MoodTagsProps) {
  const toggle = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {MOOD_TAG_OPTIONS.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => toggle(tag)}
          className={`px-4 py-2.5 rounded-full font-bold text-sm transition-all active:scale-95 ${
            selected.includes(tag)
              ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
