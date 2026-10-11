export const labels = {
  category: { normal: 'Klassisch', Thermomix: 'Thermomix', Airfryer: 'Airfryer' },
  level: { easy: 'Leicht', medium: 'Mittel', hard: 'Anspruchsvoll' },
};

export function escapeHTML(value = '') {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

export function formatTime(minutes) {
  const time = Number(minutes);
  if (!Number.isFinite(time) || time <= 0) return 'Zeit nach Rezept';
  const hours = Math.floor(time / 60);
  const rest = time % 60;
  return [hours && `${hours} Std.`, rest && `${rest} Min.`].filter(Boolean).join(' ');
}

export async function loadRecipes() {
  const response = await fetch('rezepte.json');
  if (!response.ok) throw new Error(`Rezepte konnten nicht geladen werden (${response.status}).`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Die Rezeptdatei ist ungültig.');
  return data.filter(recipe => recipe.id && recipe.name);
}

// The name disambiguates duplicate IDs without changing existing recipe data or old links.
export function recipeURL(recipe) {
  return `detail.html?${new URLSearchParams({ id: recipe.id, name: recipe.name })}`;
}

export function icon(name) {
  const paths = {
    leaf: '<path d="M20 4c-8-1-15 2-15 9a6 6 0 0 0 6 6c7 0 10-7 9-15Z"/><path d="m4 20 10-10"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
    filter: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2"/><circle cx="15" cy="17" r="2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    moon: '<path d="M20 15.5A9 9 0 0 1 8.5 4 9 9 0 1 0 20 15.5Z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    back: '<path d="M19 12H5m5-5-5 5 5 5"/>',
    shuffle: '<path d="m17 3 4 4-4 4m0 2 4 4-4 4M3 7h3c5 0 7 10 12 10h3M3 17h3c2 0 3-2 4-4m4-2c1-2 2-4 4-4h3"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.leaf}</svg>`;
}

export function initTheme() {
  const toggle = document.querySelector('#themeToggle');
  let dark = false;
  try { dark = localStorage.getItem('darkMode') === 'true'; } catch { /* Storage can be unavailable in private browsing. */ }
  function apply() {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    toggle.innerHTML = icon(dark ? 'sun' : 'moon');
    toggle.setAttribute('aria-label', dark ? 'Helles Design aktivieren' : 'Dunkles Design aktivieren');
    toggle.setAttribute('aria-pressed', String(dark));
  }
  apply();
  toggle.addEventListener('click', () => {
    dark = !dark;
    apply();
    try { localStorage.setItem('darkMode', String(dark)); } catch { /* The current theme still works without storage. */ }
  });
}
