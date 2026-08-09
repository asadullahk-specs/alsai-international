const BrandMark = ({ className = 'w-6 h-6', color = '#A9662A' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 1L14 10L23 12L14 14L12 23L10 14L1 12L10 10L12 1Z" fill={color} />
  </svg>
);

export default BrandMark;
