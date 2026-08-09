const STORAGE_KEY = 'alsai_recently_viewed';
const MAX_ITEMS = 8;

export const addRecentlyViewed = (productId) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let ids = raw ? JSON.parse(raw) : [];
    ids = [productId, ...ids.filter((id) => id !== productId)].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorage unavailable (e.g. private browsing) - recently viewed just won't persist
  }
};

export const getRecentlyViewedIds = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
