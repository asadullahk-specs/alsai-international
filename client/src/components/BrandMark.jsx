const BrandMark = ({ className = 'w-6 h-6', alt = "AL SA'I Mark" }) => (
  <img
    src="/logo.png"
    alt={alt}
    className={`${className} object-contain inline-block`}
  />
);

export default BrandMark;
