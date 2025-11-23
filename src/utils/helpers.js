export const Helpers = {
  saveToStorage: (k,v) => localStorage.setItem(k, JSON.stringify(v)),
  loadFromStorage: (k) => {
    try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return null; }
  },
  capitalize: s => s && s[0].toUpperCase() + s.slice(1)
};
