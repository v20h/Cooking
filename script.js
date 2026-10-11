import { escapeHTML, formatTime, icon, initTheme, labels, loadRecipes, recipeURL } from './common.js';

const filterDefinitions = [
  ['country', 'Küche', [['normal', 'Klassisch'], ['asian', 'Asiatisch'], ['indian', 'Indisch'], ['italian', 'Italienisch'], ['mexican', 'Mexikanisch']]],
  ['type', 'Worauf hast du Lust?', [['pasta', 'Pasta'], ['rice', 'Reis'], ['pizza', 'Pizza'], ['artisanal', 'Selbstgemacht'], ['auflauf', 'Auflauf'], ['soup', 'Suppe'], ['curry', 'Curry'], ['meat', 'Fleisch & Fisch'], ['potato', 'Kartoffeln'], ['vegetable', 'Gemüse']]],
  ['dish', 'Auf dem Teller', [['mainDish', 'Hauptgericht'], ['sideDish', 'Beilage']]],
  ['level', 'Schwierigkeit', Object.entries(labels.level)],
  ['special', 'Unsere Klassiker', [['mittwochsklassiker', 'Mittwochsklassiker']]],
];
const pageSize = 9;
const state = { recipes: [], matches: [], visible: [], category: '', page: 1, random: false, loaded: false };
const grid = document.querySelector('#imgHolder');
const emptyState = document.querySelector('#emptyState');
const search = document.querySelector('#mySearchbar');
const filters = document.querySelector('#filterContainer');
const filterToggle = document.querySelector('#toggleFilters');
const randomButton = document.querySelector('#randomButton');
const pagination = document.querySelector('#pagination');

initTheme();
document.querySelectorAll('[data-icon]').forEach(element => { element.innerHTML = icon(element.dataset.icon); });
document.querySelector('#filterGroups').innerHTML = filterDefinitions.map(([field, title, options]) => `
  <fieldset><legend>${title}</legend><div class="filter-options">${options.map(([value, label]) => `
    <label class="filter-pill"><input type="checkbox" data-field="${field}" value="${value}"><span>${label}</span></label>
  `).join('')}</div></fieldset>
`).join('');

function selectedFilters() {
  const selected = {};
  filters.querySelectorAll('input:checked').forEach(input => (selected[input.dataset.field] ??= []).push(input.value));
  return selected;
}

function updateResults() {
  if (!state.loaded) return;
  const selected = selectedFilters();
  const query = search.value.trim().toLocaleLowerCase('de');
  state.matches = state.recipes.filter(recipe =>
    (!state.category || recipe.category === state.category) &&
    recipe.name.toLocaleLowerCase('de').includes(query) &&
    Object.entries(selected).every(([field, values]) =>
      field === 'dish' || field === 'special'
        ? values.some(value => recipe[value] === true)
        : values.includes(recipe[field])
    )
  );
  state.page = 1;
  const count = Object.values(selected).flat().length;
  const badge = document.querySelector('#filterCount');
  badge.hidden = !count;
  badge.textContent = count;
  state.visible = state.random ? sampleRecipes(state.matches, 3) : state.matches;
  render();
}

function sampleRecipes(recipes, count) {
  const pool = [...recipes];
  // Partial Fisher–Yates: choose distinct recipes without biased sort comparators.
  for (let index = 0; index < Math.min(count, pool.length); index++) {
    const other = index + Math.floor(Math.random() * (pool.length - index));
    [pool[index], pool[other]] = [pool[other], pool[index]];
  }
  return pool.slice(0, count);
}

function render() {
  const totalPages = Math.ceil(state.visible.length / pageSize);
  const start = (state.page - 1) * pageSize;
  grid.innerHTML = state.visible.slice(start, start + pageSize).map(recipe => `
    <a class="card" href="${escapeHTML(recipeURL(recipe))}">
      <div class="card-image"><img src="${escapeHTML(recipe.image)}" alt="${escapeHTML(recipe.name)}" loading="lazy" decoding="async" width="600" height="450"><span class="recipeCategory">${escapeHTML(labels.category[recipe.category] || recipe.category)}</span></div>
      <div class="recipeInfo"><h3>${escapeHTML(recipe.name)}</h3><div class="card-meta"><span class="recipeTime">${icon('clock')}${formatTime(recipe.prepTime)}</span><span>${escapeHTML(labels.level[recipe.level] || 'Zum Nachkochen')}</span></div></div>
    </a>
  `).join('');
  emptyState.hidden = state.visible.length > 0;
  emptyState.innerHTML = '<h3>Heute noch nichts dabei?</h3><p>Versuche einen anderen Suchbegriff oder weniger Filter.</p><button class="button" id="clearSearch" type="button">Alle Rezepte entdecken</button>';
  const count = state.matches.length;
  document.querySelector('#resultCount').textContent = state.random
    ? `${state.visible.length} Ideen für dich · aus ${count} passenden Rezepten`
    : `${count} ${count === 1 ? 'Rezept' : 'Rezepte'}${search.value.trim() ? ` für „${search.value.trim()}“` : ' zum Entdecken'}`;
  pagination.hidden = state.random || totalPages <= 1;
  document.querySelector('#pageLabel').textContent = `Seite ${state.page} von ${totalPages}`;
  document.querySelector('#prevPage').disabled = state.page === 1;
  document.querySelector('#nextPage').disabled = state.page >= totalPages;
}

function reset() {
  search.value = '';
  filters.querySelectorAll('input').forEach(input => { input.checked = false; });
  state.category = '';
  state.random = false;
  updateCategoryButtons();
  updateResults();
}

function updateCategoryButtons() {
  document.querySelectorAll('[data-category]').forEach(button => {
    const active = button.dataset.category === state.category;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

search.addEventListener('input', updateResults);
filters.addEventListener('change', updateResults);
filterToggle.addEventListener('click', () => {
  filters.hidden = !filters.hidden;
  filterToggle.setAttribute('aria-expanded', String(!filters.hidden));
});
document.querySelector('#resetFilters').addEventListener('click', () => {
  filters.querySelectorAll('input').forEach(input => { input.checked = false; });
  updateResults();
});
document.querySelector('#categoryTabs').addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  state.category = button.dataset.category;
  state.random = false;
  updateCategoryButtons();
  updateResults();
});
randomButton.addEventListener('click', () => { state.random = true; updateResults(); });
emptyState.addEventListener('click', event => {
  if (event.target.closest('#clearSearch')) reset();
  if (event.target.closest('#retryLoad')) initialize();
});
pagination.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button || button.disabled) return;
  state.page += button.id === 'nextPage' ? 1 : -1;
  render();
  document.querySelector('#recipes').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
});

async function initialize() {
  grid.setAttribute('aria-busy', 'true');
  emptyState.hidden = true;
  try {
    state.recipes = await loadRecipes();
    state.loaded = true;
    document.querySelector('#recipeTotal').textContent = `${state.recipes.length} Lieblingsrezepte`;
    updateResults();
  } catch {
    grid.innerHTML = '';
    pagination.hidden = true;
    document.querySelector('#resultCount').textContent = 'Die Rezepte konnten nicht geladen werden.';
    emptyState.hidden = false;
    emptyState.innerHTML = '<h3>Das Kochbuch macht kurz Pause.</h3><p>Bitte versuche es gleich noch einmal.</p><button class="button" id="retryLoad" type="button">Erneut versuchen</button>';
  } finally {
    grid.setAttribute('aria-busy', 'false');
  }
}

initialize();
