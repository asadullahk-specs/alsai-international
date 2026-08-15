import BrandMark from './BrandMark';

// A signature luxury brand spinner matching the login/logout transition loader.
// Features a spinning gold ring around the centered AL SA'I brand mark and typography.
const BrandSpinner = ({ fullPage = false, className = '', message = null, size = 'normal' }) => {
  const isSmall = size === 'small';

  const content = (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className={`relative ${isSmall ? 'w-12 h-12' : 'w-20 h-20'} flex items-center justify-center`}>
        <svg viewBox="0 0 80 80" className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: '1.1s' }}>
          <circle cx="40" cy="40" r="35" fill="none" stroke="#E9DFCE" strokeWidth="4" />
          <circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke="#A9662A"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="55 165"
          />
        </svg>
        <BrandMark className={isSmall ? 'w-4 h-4' : 'w-7 h-7'} />
      </div>
      <div className="flex flex-col items-center text-center">
        <span className={`font-serif ${isSmall ? 'text-sm' : 'text-lg'} tracking-wide text-ink`}>AL SA&apos;I</span>
        <span className={`${isSmall ? 'text-[7px]' : 'text-[8px]'} tracking-[0.3em] text-muted`}>EXTRAIT DE PARFUM</span>
        {message && <p className="text-xs text-muted mt-2 tracking-wide">{message}</p>}
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[55vh] flex items-center justify-center px-4 py-12">
        {content}
      </div>
    );
  }

  return content;
};

export default BrandSpinner;
