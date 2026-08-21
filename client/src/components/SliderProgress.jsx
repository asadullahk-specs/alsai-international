import { useState, useEffect, useCallback } from 'react';

const SliderProgress = ({ scrollRef, total = 0, itemLabel = 'cards', maxBreakpoint = true }) => {
  const [progress, setProgress] = useState({
    current: total,
    remaining: 0,
    activeIndex: 0,
  });

  const updateProgress = useCallback(() => {
    if (!scrollRef.current || total <= 0) {
      setProgress({ current: total, remaining: 0, activeIndex: 0 });
      return;
    }

    const el = scrollRef.current;
    const firstChild = el.children[0];
    if (!firstChild) return;

    const itemWidth = firstChild.offsetWidth;
    const style = window.getComputedStyle(el);
    const gap = parseFloat(style.columnGap || style.gap || '0') || 16;
    const step = itemWidth + gap;

    if (step <= 0) return;

    const clientWidth = el.clientWidth;
    const scrollLeft = el.scrollLeft;
    const scrollWidth = el.scrollWidth;

    const visibleCount = Math.max(1, Math.round(clientWidth / step));
    const scrolledCount = Math.round(scrollLeft / step);
    const isNearEnd = scrollLeft + clientWidth >= scrollWidth - 10;

    const activeIndex = Math.min(total - 1, Math.max(0, Math.round(scrollLeft / step)));
    const current = isNearEnd ? total : Math.min(total, Math.max(visibleCount, scrolledCount + visibleCount));
    const remaining = Math.max(0, total - current);

    setProgress({ current, remaining, activeIndex });
  }, [scrollRef, total]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateProgress();

    el.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    const observer = new ResizeObserver(() => updateProgress());
    observer.observe(el);

    const timer = setTimeout(updateProgress, 200);

    return () => {
      el.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [scrollRef, total, updateProgress]);

  if (total <= 0 || progress.remaining <= 0) return null;

  const singular = itemLabel.endsWith('s') ? itemLabel.slice(0, -1) : itemLabel;
  const label = total === 1 ? singular : itemLabel;

  return (
    <div className={`flex flex-col items-center gap-2 mt-6 mb-2 select-none ${maxBreakpoint ? 'lg:hidden' : ''}`}>
      <div className="bg-cream-100/90 border border-cream-200 text-charcoal text-xs font-medium px-4 py-1.5 rounded-full tracking-wide shadow-xs">
        {progress.current} of {total} {label} · {progress.remaining} left to view
      </div>
    </div>
  );
};

export default SliderProgress;
