import { useMemo, useState } from 'react';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { CATEGORIES, CATEGORY_GROUPS, TEMPLATES } from '../data/templates';

// With 650+ designs the occasion bar needs a level above it: pick a family of
// occasions first, then the occasion itself. Counts come straight from the
// catalogue so a chip never leads to an empty shelf.
const COLLAPSED_COUNT = 14;

const tabBase = 'flex-shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[11px] sm:text-xs font-semibold border transition-all duration-200';
const tabOn = 'bg-[#800020] text-white border-[#800020] shadow-[0_8px_18px_-12px_rgba(128,0,32,1)]';
const tabOff = 'bg-white text-gray-600 border-[#eadfc9] hover:border-[#800020]/45 hover:text-[#800020]';

const useCounts = () => useMemo(() => {
  const map = {};
  TEMPLATES.forEach((t) => { map[t.category] = (map[t.category] || 0) + 1; });
  return map;
}, []);

const CategoryFilter = ({ activeCategory, onCategoryChange }) => {
  const counts = useCounts();
  const [showAll, setShowAll] = useState(false);

  // Which family does the current selection belong to?
  const activeGroup = useMemo(() => (
    CATEGORY_GROUPS.find((g) => activeCategory === `group:${g.id}`)
    || CATEGORY_GROUPS.find((g) => g.ids.includes(activeCategory))
    || CATEGORY_GROUPS[0]
  ), [activeCategory]);

  // Only occasions that actually have designs, so no chip ever leads to nothing.
  // The leading chip covers the whole family, so a family tab never silently
  // narrows down to one occasion.
  const chips = useMemo(() => {
    const isPopular = activeGroup.id === 'popular';
    const list = CATEGORIES
      .filter((c) => c.id === 'all' || isPopular || activeGroup.ids.includes(c.id))
      .filter((c) => c.id === 'all' || (counts[c.id] || 0) > 0);

    return list.map((c) => {
      if (c.id !== 'all') return { value: c.id, label: c.label, count: counts[c.id] || 0 };
      return {
        value: isPopular ? 'all' : `group:${activeGroup.id}`,
        label: isPopular ? 'All' : activeGroup.allLabel,
        count: isPopular
          ? TEMPLATES.length
          : activeGroup.ids.reduce((sum, id) => sum + (counts[id] || 0), 0),
      };
    });
  }, [activeGroup, counts]);

  const visibleChips = showAll ? chips : chips.slice(0, COLLAPSED_COUNT);
  const canExpand = chips.length > COLLAPSED_COUNT;

  return (
    <div className="w-full">
      {/* Occasion family — one tidy row, scrollable on narrow screens */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
        {CATEGORY_GROUPS.map((g) => {
          const total = g.id === 'popular'
            ? TEMPLATES.length
            : g.ids.reduce((sum, id) => sum + (counts[id] || 0), 0);
          if (!total) return null;
          const active = activeGroup.id === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => {
                onCategoryChange(g.id === 'popular' ? 'all' : `group:${g.id}`);
                setShowAll(false);
              }}
              aria-pressed={active}
              className={`${tabBase} ${active ? tabOn : tabOff}`}
            >
              {g.label}
              <span className={`text-[10px] font-normal ${active ? 'text-white/70' : 'text-gray-400'}`}>{total}</span>
            </button>
          );
        })}
      </div>

      {/* Occasions — collapsed to one sliding row, expands to a bounded grid */}
      <div className={`mt-2 gap-2 ${showAll ? 'flex flex-wrap max-h-52 overflow-y-auto pr-1' : 'flex overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0'} pb-1`}>
        {visibleChips.map((chip) => {
          const active = activeCategory === chip.value;
          return (
            <button
              key={chip.value}
              type="button"
              onClick={() => onCategoryChange(chip.value)}
              aria-pressed={active}
              className={`${tabBase} ${active ? tabOn : tabOff} font-medium`}
            >
              {chip.label}
              <span className={`text-[10px] font-normal ${active ? 'text-white/65' : 'text-gray-400'}`}>{chip.count}</span>
            </button>
          );
        })}

        {canExpand && (
          <button
            type="button"
            onClick={() => setShowAll((s) => !s)}
            className={`${tabBase} !px-3 bg-[#800020]/8 text-[#800020] border-[#800020]/20 hover:bg-[#800020]/15`}
          >
            {showAll ? (
              <>Show less <HiChevronUp className="w-3.5 h-3.5" /></>
            ) : (
              <>All {chips.length - 1} occasions <HiChevronDown className="w-3.5 h-3.5" /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default CategoryFilter;
