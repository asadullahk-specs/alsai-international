import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import customerAxios from '../api/customerAxios';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
  const { user, loading: authLoading } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    customerAxios
      .get('/wishlist')
      .then(({ data }) => setWishlist(data.data.wishlist))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-2xl text-ink mb-3">Sign in to see your wishlist</h1>
        <Link
          to="/login"
          state={{ from: '/wishlist' }}
          className="inline-block bg-brand hover:bg-brand-dark text-white text-xs tracking-widest px-8 py-3 rounded-md transition-colors"
        >
          LOGIN
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="font-serif text-3xl text-ink mb-1">Your Wishlist</h1>
      <p className="text-xs text-muted mb-8">
        <Link to="/" className="hover:text-brand">
          Home
        </Link>{' '}
        &gt; Wishlist
      </p>

      {wishlist.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted text-sm mb-6">You haven't saved anything yet.</p>
          <Link to="/shop" className="text-brand text-sm hover:underline">
            Browse the shop →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
