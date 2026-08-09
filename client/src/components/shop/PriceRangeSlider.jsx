import { useState, useEffect, useCallback } from 'react';
import { formatPrice } from '../../utils/formatPrice';

const ABSOLUTE_MIN = 0;
const ABSOLUTE_MAX = 50000;
const STEP = 500;

// A dual-thumb slider built from two overlapping native <input type="range">
// elements - no extra dependency, fully keyboard accessible, and it visually
// matches "drag the ends" price filters rather than typed min/max fields.
const PriceRangeSlider = ({ minPrice, maxPrice, onChange }) => {
  const [min, setMin] = useState(minPrice ? Number(minPrice) : ABSOLUTE_MIN);
  const [max, setMax] = useState(maxPrice ? Number(maxPrice) : ABSOLUTE_MAX);

  useEffect(() => {
    setMin(minPrice ? Number(minPrice) : ABSOLUTE_MIN);
    setMax(maxPrice ? Number(maxPrice) : ABSOLUTE_MAX);
  }, [minPrice, maxPrice]);

  const commit = useCallback(
    (nextMin, nextMax) => {
      onChange(nextMin > ABSOLUTE_MIN ? nextMin : '', nextMax < ABSOLUTE_MAX ? nextMax : '');
    },
    [onChange]
  );

  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), max - STEP);
    setMin(value);
    commit(value, max);
  };

  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), min + STEP);
    setMax(value);
    commit(min, value);
  };

  const minPercent = ((min - ABSOLUTE_MIN) / (ABSOLUTE_MAX - ABSOLUTE_MIN)) * 100;
  const maxPercent = ((max - ABSOLUTE_MIN) / (ABSOLUTE_MAX - ABSOLUTE_MIN)) * 100;

  return (
    <div className="pt-1">
      <div className="relative h-1 bg-cream-200 mb-4">
        <div className="absolute h-1 bg-brand" style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }} />
        <input
          type="range"
          min={ABSOLUTE_MIN}
          max={ABSOLUTE_MAX}
          step={STEP}
          value={min}
          onChange={handleMinChange}
          className="price-range-thumb absolute w-full top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none"
        />
        <input
          type="range"
          min={ABSOLUTE_MIN}
          max={ABSOLUTE_MAX}
          step={STEP}
          value={max}
          onChange={handleMaxChange}
          className="price-range-thumb absolute w-full top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none"
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{formatPrice(min)}</span>
        <span>{formatPrice(max)}{max >= ABSOLUTE_MAX ? '+' : ''}</span>
      </div>
    </div>
  );
};

export default PriceRangeSlider;
