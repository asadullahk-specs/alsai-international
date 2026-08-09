import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'alsai_cart';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // localStorage unavailable - cart just won't persist across reloads this session
    }
  }, [items]);

  const addItem = (product, size, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.productId === product._id && i.size === size.size);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = { ...next[existingIndex], quantity: next[existingIndex].quantity + quantity };
        return next;
      }
      return [
        ...prev,
        {
          productId: product._id,
          slug: product.slug,
          name: product.name,
          image: product.mainImage,
          size: size.size,
          price: size.salePrice || size.price,
          maxStock: size.stock,
          quantity,
        },
      ];
    });
  };

  const removeItem = (productId, size) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.size === size)));
  };

  const updateQuantity = (productId, size, quantity) => {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId && i.size === size ? { ...i, quantity: Math.max(1, quantity) } : i))
    );
  };

  const clearCart = () => setItems([]);

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
