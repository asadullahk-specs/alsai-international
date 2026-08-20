import { useEffect } from 'react';

// Sets the browser tab title for the current page. Pattern: "AL SA'I | Section"
// or, for a specific record, "AL SA'I | Section | Name". Resets to the base
// brand title on unmount so navigating away (or to a page that doesn't call
// this hook) never leaves a stale title behind.
const usePageTitle = (section, name) => {
  useEffect(() => {
    if (!section && !name) {
      document.title = "AL SA'I International";
    } else {
      const parts = ["AL SA'I", section, name].filter(Boolean);
      document.title = parts.join(' | ');
    }
    return () => {
      document.title = "AL SA'I International";
    };
  }, [section, name]);
};

export default usePageTitle;
