import { HiSearch, HiX, HiVideoCamera, HiOutlineHeart, HiHeart } from 'react-icons/hi';
import CategoryFilter from './CategoryFilter';
import { LANGUAGES } from '../data/templates';

// Toolbar styling — kept identical to the original so nothing else changes
const TOOL_BASE = 'inline-flex items-center gap-1.5 h-10 px-4 rounded-full text-xs font-semibold border transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#800020]/20';
const TOOL_OFF = 'bg-white text-gray-600 border-[#eadfc9] hover:border-[#800020]/45 hover:text-[#800020]';
const TOOL_ON = 'bg-[#800020] text-white border-[#800020] shadow-[0_8px_18px_-12px_rgba(128,0,32,1)]';
const TOOL_ON_ROSE = 'bg-[#e0486b] text-white border-[#e0486b] shadow-[0_8px_18px_-12px_rgba(224,72,107,1)]';

const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest first' },
  { id: 'occasion', label: 'Occasion A–Z' },
  { id: 'name', label: 'Design A–Z' },
];

/**
 * Filter bar.
 *
 * The section flows naturally with the page (no `position: sticky`) so it
 * scrolls in and out of view alongside the template cards. The horizontal
 * chip rows inside remain horizontally scrollable on narrow screens.
 */
const FiltersSticky = ({
  query, setQuery,
  sort, setSort,
  language, setLanguage,
  showVideoOnly, setShowVideoOnly,
  showPicksOnly, setShowPicksOnly,
  picks,
  activeCategory, setActiveCategory,
  hasFilters, onReset,
}) => {
  return (
    <div className="relative z-20 bg-[#fffbf5] border-y border-[#f0e3cd]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
          {/* Toolbar */}
          <div className="rounded-2xl bg-white border border-[#eadfc9] shadow-[0_12px_30px_-24px_rgba(128,0,32,0.85)] p-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative order-1 basis-full sm:basis-auto sm:flex-1 min-w-[200px]">
                <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search designs — ganpati, mandala, haldi, royal blue…"
                  className="w-full h-10 pl-10 pr-9 rounded-full bg-[#fdfaf5] border border-[#eadfc9] text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020]/40 focus:bg-white transition-colors"
                  aria-label="Search templates"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200/80 text-gray-600 flex items-center justify-center hover:bg-gray-300"
                  >
                    <HiX className="w-3 h-3" />
                  </button>
                )}
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort designs"
                className={`${TOOL_BASE} ${TOOL_OFF} appearance-none pr-5 cursor-pointer`}
              >
                {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                aria-label="Filter by language"
                className={`${TOOL_BASE} ${TOOL_OFF} appearance-none pr-5 cursor-pointer`}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>{l.id === 'all' ? 'All languages' : l.label}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowVideoOnly((v) => !v)}
                aria-pressed={showVideoOnly}
                className={`${TOOL_BASE} ${showVideoOnly ? TOOL_ON : TOOL_OFF}`}
              >
                <HiVideoCamera className="w-3.5 h-3.5" /> Video
              </button>

              <button
                type="button"
                onClick={() => setShowPicksOnly((v) => !v)}
                aria-pressed={showPicksOnly}
                className={`${TOOL_BASE} ${showPicksOnly ? TOOL_ON_ROSE : TOOL_OFF}`}
              >
                {showPicksOnly ? <HiHeart className="w-4 h-4" /> : <HiOutlineHeart className="w-4 h-4" />}
                My picks
                <span className={showPicksOnly ? 'text-white/75' : 'text-gray-400'}>{picks.size}</span>
              </button>

              {hasFilters && (
                <button
                  type="button"
                  onClick={onReset}
                  className={`${TOOL_BASE} bg-white text-[#800020] border-[#800020]/25 hover:bg-[#800020]/8`}
                >
                  <HiX className="w-3.5 h-3.5" /> Reset
                </button>
              )}
            </div>
          </div>

          {/* Occasion family + occasion chips */}
          <div className="mt-2.5">
            <CategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
          </div>
        </div>
      </div>
  );
};

export default FiltersSticky;
