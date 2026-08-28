import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiVideoCamera, HiSparkles, HiSearch, HiX, HiOutlineHeart, HiHeart } from 'react-icons/hi';
import CategoryFilter from '../components/CategoryFilter';
import TemplateCard from '../components/TemplateCard';
import Pagination from '../components/Pagination';
import { TEMPLATES, CATEGORIES, getGroup, getGroupIds, LANGUAGES } from '../data/templates';
import logoMark from '../assets/logo-mark.png';

const PICKS_KEY = 'guestinvitation_picked';
const readPicks = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(PICKS_KEY) || '[]'));
  } catch {
    return new Set();
  }
};

const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest first' },
  { id: 'occasion', label: 'Occasion A–Z' },
  { id: 'name', label: 'Design A–Z' },
];

const PAGE_SIZE = 24;

// Shared toolbar styling — one visual language for every control in the bar
const TOOL_BASE = 'inline-flex items-center gap-1.5 h-10 px-4 rounded-full text-xs font-semibold border transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#800020]/20';
const TOOL_OFF = 'bg-white text-gray-600 border-[#eadfc9] hover:border-[#800020]/45 hover:text-[#800020]';
const TOOL_ON = 'bg-[#800020] text-white border-[#800020] shadow-[0_8px_18px_-12px_rgba(128,0,32,1)]';
const TOOL_ON_ROSE = 'bg-[#e0486b] text-white border-[#e0486b] shadow-[0_8px_18px_-12px_rgba(224,72,107,1)]';

const HomePage = () => {
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [templates] = useState(TEMPLATES);
  const [showVideoOnly, setShowVideoOnly] = useState(false);
  const [language, setLanguage] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');
  const [picks, setPicks] = useState(readPicks);
  const [showPicksOnly, setShowPicksOnly] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) setActiveCategory(category);
  }, [searchParams]);

  const togglePick = (key) => {
    setPicks((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      try { localStorage.setItem(PICKS_KEY, JSON.stringify([...next])); } catch { /* storage full */ }
      return next;
    });
  };

  const filteredTemplates = useMemo(() => {
    const q = query.trim().toLowerCase();
    // A family tab ("group:festivals") covers every occasion inside it
    const groupIds = getGroupIds(activeCategory);
    const list = templates.filter((t) => {
      if (groupIds) { if (!groupIds.includes(t.category)) return false; }
      else if (activeCategory !== 'all' && t.category !== activeCategory) return false;
      if (showVideoOnly && !t.hasVideo) return false;
      if (language !== 'all' && t.language !== language) return false;
      if (showPicksOnly && !picks.has(t.slug || t._id)) return false;
      if (q) {
        const hay = `${t.name} ${t.category} ${t.sampleText?.event || ''} ${t.sampleText?.blessing || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (sort === 'newest') return [...list].reverse();
    if (sort === 'occasion') return [...list].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
    if (sort === 'name') return [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [templates, activeCategory, showVideoOnly, language, showPicksOnly, picks, query, sort]);

  // Any filter change should take the shelf back to page 1
  useEffect(() => { setPage(1); }, [activeCategory, showVideoOnly, language, query, sort, showPicksOnly]);

  const totalPages = Math.max(1, Math.ceil(filteredTemplates.length / PAGE_SIZE));
  const shown = filteredTemplates.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = activeCategory !== 'all' || showVideoOnly || language !== 'all' || query.trim() !== '' || showPicksOnly;

  const totalTemplates = templates.length;
  const videoTemplates = templates.filter((t) => t.hasVideo).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fffbf5] via-[#fdf8f0] to-[#fffbf5]">
      {/* Hero Section */}
      <section className="relative pt-10 pb-14 md:pt-16 md:pb-20 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#800020]/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-24 w-64 h-64 bg-[#B8860B]/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#800020]/10 text-[#800020] text-xs md:text-sm font-medium mb-6 border border-[#800020]/20">
                <HiSparkles className="w-4 h-4" />
                <span>{totalTemplates}+ Premium Templates · Video + Audio</span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.6rem] font-display font-bold text-[#800020] leading-[1.1] mb-5">
                Beautiful invites for
                <span className="block text-[#B8860B]">every celebration</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-gray-600 font-body mb-3 max-w-xl leading-relaxed">
                Weddings, festivals, birthdays, baby showers and more. Customize in minutes, download instantly.
              </p>

              {/* Description */}
              <p className="text-gray-500 text-base mb-8 max-w-lg">
                Apno ko bulane ka naya tareeka. Hindi, English, Marathi — WhatsApp ready invites with Indian music.
              </p>

              {/* Pricing Cards */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-[#e8dcc4] shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-[#800020]/10 flex items-center justify-center text-[#800020]">
                    <span className="font-display font-bold text-sm">₹49</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Clean Image</p>
                    <p className="text-xs text-gray-500">PNG + PDF without watermark</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-[#e8dcc4] shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-[#B8860B]/15 flex items-center justify-center text-[#B8860B]">
                    <HiVideoCamera className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">₹99 Image + Video</p>
                    <p className="text-xs text-gray-500">Both files with Indian music</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <a
                href="#templates"
                className="inline-flex items-center gap-2 bg-[#800020] text-white px-8 py-4 rounded-full font-semibold text-base hover:bg-[#6a0018] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Create your invitation
                <span className="text-lg">→</span>
              </a>
            </motion.div>

            {/* Right: Preview Cards Stack */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:flex justify-center items-center relative h-[460px]"
            >
              {/* Card 1 - behind left */}
              <div className="absolute left-2 top-10 w-[210px] h-[340px] rounded-3xl overflow-hidden shadow-2xl transform -rotate-6 border-4 border-white">
                <img src="/templates/wedding-04.png" alt="" className="w-full h-full object-cover" />
              </div>
              {/* Card 2 - center front */}
              <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[240px] h-[390px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white z-10">
                <img src="/templates/ganpati-05.png" alt="" className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 backdrop-blur-md bg-[#800020]/90 text-white text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1 shadow-lg border border-white/20">
                  <HiVideoCamera className="w-3.5 h-3.5" /> + Video
                </div>
              </div>
              {/* Card 3 - behind right */}
              <div className="absolute right-2 top-14 w-[210px] h-[340px] rounded-3xl overflow-hidden shadow-2xl transform rotate-6 border-4 border-white">
                <img src="/templates/diwali-02.png" alt="" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 py-4 px-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-[#e8dcc4]">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-display font-bold text-[#800020]">{totalTemplates}+</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Templates</p>
            </div>
            <div className="w-px h-10 bg-[#e8dcc4] hidden sm:block" />
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-display font-bold text-[#800020]">{videoTemplates}+</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">With Video</p>
            </div>
            <div className="w-px h-10 bg-[#e8dcc4] hidden sm:block" />
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-display font-bold text-[#800020]">3</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Languages</p>
            </div>
            <div className="w-px h-10 bg-[#e8dcc4] hidden sm:block" />
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-display font-bold text-[#800020]">{CATEGORIES.length - 1}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Occasions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section — solid bar, tidy rows, sticks under the navbar */}
      <section className="relative z-30 bg-[#fffbf5] border-y border-[#f0e3cd] py-3 md:sticky md:top-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
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
                  onClick={() => { setActiveCategory('all'); setShowVideoOnly(false); setLanguage('all'); setQuery(''); setShowPicksOnly(false); setSort('featured'); }}
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
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-6 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4 gap-3">
            <h2 className="text-xl md:text-2xl font-display font-bold text-[#800020]">
              {showPicksOnly
                ? 'My picked designs'
                : activeCategory === 'all'
                  ? 'All Templates'
                  : getGroup(activeCategory)?.allLabel || CATEGORIES.find(c => c.id === activeCategory)?.label || 'Templates'}
            </h2>
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {filteredTemplates.length} design{filteredTemplates.length === 1 ? '' : 's'}
              {totalPages > 1 ? ` · page ${page} of ${totalPages}` : ''}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
            {shown.map((template, idx) => (
              <TemplateCard
                key={template._id}
                template={template}
                index={idx}
                favourite={picks.has(template.slug || template._id)}
                onToggleFavourite={togglePick}
              />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filteredTemplates.length}
            onPageChange={(p) => {
              setPage(p);
              document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {filteredTemplates.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">
                {showPicksOnly && picks.size === 0
                  ? 'Tap the heart on any design to keep it here while you browse.'
                  : 'No designs match these filters yet.'}
              </p>
              <button
                onClick={() => { setActiveCategory('all'); setShowVideoOnly(false); setLanguage('all'); setQuery(''); setShowPicksOnly(false); }}
                className="btn-secondary mt-4"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
