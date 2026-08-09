import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="max-w-lg mx-auto px-4 py-24 text-center">
    <p className="text-brand text-xs tracking-[0.25em] mb-3">PAGE NOT FOUND</p>
    <h1 className="font-serif text-6xl text-ink mb-4">404</h1>
    <p className="text-muted text-sm mb-8">The page you're looking for doesn't exist or has been moved.</p>
    <Link
      to="/"
      className="inline-block bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-8 py-3 rounded-md transition-colors"
    >
      BACK TO HOME
    </Link>
  </div>
);

export default NotFound;
