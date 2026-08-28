import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

/**
 * Smart pagination — shows first/last pages, the current page with neighbours,
 * and ellipsis for gaps. Matches the design in the reference screenshot:
 *   < Prev  1  2  …  118  Next >
 *   Page 1 of 118 · 2824 designs
 */
const Pagination = ({ page, totalPages, totalItems, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Build a compact list of page numbers to display
  const pages = [];
  const add = (p) => { if (p >= 1 && p <= totalPages && !pages.includes(p)) pages.push(p); };

  add(1);
  add(2);
  for (let p = page - 1; p <= page + 1; p++) add(p);
  add(totalPages - 1);
  add(totalPages);
  pages.sort((a, b) => a - b);

  // Insert ellipsis markers
  const display = [];
  for (let i = 0; i < pages.length; i++) {
    if (i > 0 && pages[i] - pages[i - 1] > 1) display.push('…');
    display.push(pages[i]);
  }

  const btn = (active) =>
    `w-9 h-9 rounded-full text-sm font-medium transition-all flex items-center justify-center ${
      active
        ? 'bg-[#800020] text-white shadow-md'
        : 'bg-white text-gray-600 border border-[#eadfc9] hover:border-[#800020]/40 hover:text-[#800020]'
    }`;

  const navBtn = (disabled) =>
    `w-9 h-9 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-1 ${
      disabled
        ? 'bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200'
        : 'bg-white text-gray-600 border border-[#eadfc9] hover:border-[#800020]/40 hover:text-[#800020] cursor-pointer'
    }`;

  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <div className="flex items-center gap-1.5">
        {/* Prev */}
        <button
          onClick={() => page > 1 && onPageChange(page - 1)}
          disabled={page <= 1}
          className={navBtn(page <= 1)}
          aria-label="Previous page"
        >
          <HiChevronLeft className="w-4 h-4" /> Prev
        </button>

        {/* Page numbers */}
        {display.map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={btn(p === page)}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => page < totalPages && onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={navBtn(page >= totalPages)}
          aria-label="Next page"
        >
          Next <HiChevronRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-gray-400">
        Page {page} of {totalPages} · {totalItems} design{totalItems === 1 ? '' : 's'}
      </p>
    </div>
  );
};

export default Pagination;
