const memory = new Map();

function getStore() {
  try { return typeof localStorage === "undefined" ? null : localStorage; } catch (_) { return null; }
}

export const localGameStorage = {
  getNumber(key, fallback = 0) {
    const value = getStore()?.getItem(key) ?? memory.get(key);
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  },
  getBoolean(key, fallback = false) {
    const value = getStore()?.getItem(key) ?? memory.get(key);
    return value == null ? fallback : value === "true" || value === "on";
  },
  set(key, value) {
    memory.set(key, String(value));
    try { getStore()?.setItem(key, String(value)); } catch (_) { /* storage indisponível */ }
  }
};
