import { escapeHTML, formatTime, icon, initTheme, labels, loadRecipes } from './common.js';

initTheme();
document.querySelector('#brandIcon').innerHTML = icon('leaf');
const container = document.querySelector('#detailContainer');

function ingredientHTML(ingredient) {
  const colon = ingredient.indexOf(':');
  const text = colon < 0 ? escapeHTML(ingredient)
    : `<strong>${escapeHTML(ingredient.slice(0, colon))}</strong>${escapeHTML(ingredient.slice(colon))}`;
  return `<li><label><input type="checkbox"><span>${text}</span></label></li>`;
}

function renderRecipe(recipe) {
  document.title = `${recipe.name} · Kcooks`;
  const steps = recipe.instructions.split(/(?:\\n|\n)+/).map(step => step.trim()).filter(Boolean);
  const appURL = /^https?:\/\//i.test(recipe.appLink || '') ? recipe.appLink : '';
  container.innerHTML = `
    <a class="back-link detail-back" href="index.html">${icon('back')} Zurück zur Sammlung</a>
    <article>
      <div class="detail-hero">
        <img id="detailImg" class="detail-photo" src="${escapeHTML(recipe.image)}" alt="${escapeHTML(recipe.name)}" width="900" height="900">
        <div class="detail-intro"><p class="eyebrow">${escapeHTML(labels.category[recipe.category] || recipe.category)}</p><h1 id="myDetailHeading">${escapeHTML(recipe.name)}</h1>
          <p class="detail-subtitle">Ein gutes Essen beginnt mit einer guten Idee.<br>Schön, dass du diese ausprobierst.</p>
          <dl class="recipe-facts"><div><dt>Zubereitung</dt><dd>${icon('clock')}${formatTime(recipe.prepTime)}</dd></div><div><dt>Schwierigkeit</dt><dd>${escapeHTML(labels.level[recipe.level] || recipe.level || '–')}</dd></div><div><dt>Portionen</dt><dd>${escapeHTML(recipe.portions || '–')}</dd></div></dl>
          <div class="detail-actions"><a class="button primary-button" href="#preparation">Los geht’s ${icon('arrow')}</a><button class="button" id="wakeLockButton" type="button" aria-pressed="false" hidden>Display anlassen</button></div>
          <p class="wake-status" id="wakeStatus" role="status"></p>
        </div>
      </div>
      <div class="recipe-body">
        <section class="ingredients-panel" aria-labelledby="ingredientsTitle"><p class="eyebrow">ALLES BEREITLEGEN</p><h2 id="ingredientsTitle">Zutaten</h2><p class="section-note">Was du schon hast, kannst du abhaken.</p><ul id="detailZutaten">${recipe.ingredients.map(ingredientHTML).join('')}</ul></section>
        <section class="preparation-panel" id="preparation" aria-labelledby="preparationTitle"><p class="eyebrow">SCHRITT FÜR SCHRITT</p><h2 id="preparationTitle">So wird’s lecker.</h2><ol class="instruction-list" id="detailInstructions">${steps.map(step => `<li><p>${escapeHTML(step)}</p></li>`).join('')}</ol>${appURL ? `<a class="text-link source-link" href="${escapeHTML(appURL)}" target="_blank" rel="noopener noreferrer">Zum Originalrezept ${icon('arrow')}</a>` : ''}</section>
      </div>
    </article>`;
  initWakeLock();
}

// Keep the screen awake only when someone explicitly opts in while cooking.
function initWakeLock() {
  if (!('wakeLock' in navigator)) return;
  const button = document.querySelector('#wakeLockButton');
  const status = document.querySelector('#wakeStatus');
  let lock = null;
  let enabled = false;
  button.hidden = false;
  async function acquire() {
    try {
      lock = await navigator.wakeLock.request('screen');
      button.setAttribute('aria-pressed', 'true');
      status.textContent = 'Dein Display bleibt beim Kochen an.';
      lock.addEventListener('release', () => {
        lock = null;
        button.setAttribute('aria-pressed', 'false');
        status.textContent = enabled ? 'Display-Pause. Beim Zurückkehren geht es weiter.' : '';
      });
    } catch {
      enabled = false;
      button.setAttribute('aria-pressed', 'false');
      status.textContent = 'Dein Gerät kann das Display gerade nicht anlassen.';
    }
  }
  button.addEventListener('click', async () => {
    enabled = !enabled;
    button.disabled = true;
    try {
      if (enabled) await acquire();
      else if (lock) await lock.release();
      else status.textContent = '';
    } finally {
      button.disabled = false;
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (enabled && !lock && document.visibilityState === 'visible') acquire();
  });
}

async function initialize() {
  try {
    const params = new URLSearchParams(location.search);
    const recipes = await loadRecipes();
    const recipe = recipes.find(item => item.id === params.get('id') && (!params.has('name') || item.name === params.get('name')));
    if (!recipe) {
      container.innerHTML = '<div class="empty-state"><h1>Dieses Rezept finden wir leider nicht.</h1><p>In der Sammlung wartet bestimmt etwas Leckeres auf dich.</p><a class="button" href="index.html">Rezepte entdecken</a></div>';
      return;
    }
    renderRecipe(recipe);
  } catch {
    container.innerHTML = '<div class="empty-state" role="alert"><h1>Das Rezept konnte nicht geladen werden.</h1><p>Bitte versuche es noch einmal.</p><button class="button" id="retryLoad" type="button">Erneut versuchen</button></div>';
    document.querySelector('#retryLoad').addEventListener('click', initialize);
  } finally {
    container.setAttribute('aria-busy', 'false');
  }
}

initialize();
