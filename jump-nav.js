(() => {
  'use strict';

  const jumpbar = document.getElementById('character-jumpbar');
  if (!jumpbar) return;

  const buttons = [...jumpbar.querySelectorAll('.character-jump-button[data-character-target]')];
  if (!buttons.length) return;

  function clearVisibleFilters() {
    const search = document.getElementById('character-search');
    if (search) {
      search.value = '';
      // Let the main page filter state update when app.js is available.
      search.dispatchEvent(new Event('input', { bubbles: true }));
    }

    const reset = document.getElementById('reset-filters');
    if (reset && !reset.hidden) reset.click();

    // Fallback: even if the main script failed, the requested card must be visible.
    document.querySelectorAll('.character-card').forEach((card) => {
      card.hidden = false;
    });
  }

  function headerOffset() {
    const topbar = document.querySelector('.app-topbar');
    const height = topbar ? topbar.getBoundingClientRect().height : 72;
    return Math.ceil(height + 12);
  }

  function markCurrent(button) {
    buttons.forEach((item) => {
      const current = item === button;
      item.classList.toggle('is-current', current);
      if (current) item.setAttribute('aria-current', 'true');
      else item.removeAttribute('aria-current');
    });
  }

  function goToCharacter(button, smooth = true) {
    const targetId = button?.dataset?.characterTarget;
    if (!targetId) return false;
    const card = document.getElementById(targetId);
    if (!card) return false;

    clearVisibleFilters();

    // Close every other card and force the selected details open.
    document.querySelectorAll('details.character-card').forEach((item) => {
      item.open = item === card;
    });
    card.hidden = false;
    card.open = true;
    markCurrent(button);

    // Update the URL fragment without causing a premature native jump.
    if (history.replaceState) {
      history.replaceState(null, '', `#${targetId}`);
    }

    // Force the expanded details layout to be measured before scrolling.
    void card.offsetHeight;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const top = card.getBoundingClientRect().top + window.scrollY - headerOffset();
        window.scrollTo({ top: Math.max(0, top), behavior: smooth ? 'smooth' : 'auto' });

        // A second correction handles browsers that recalculate <details> height late.
        window.setTimeout(() => {
          const correctedTop = card.getBoundingClientRect().top + window.scrollY - headerOffset();
          if (Math.abs(card.getBoundingClientRect().top - headerOffset()) > 4) {
            window.scrollTo({ top: Math.max(0, correctedTop), behavior: 'auto' });
          }
          card.querySelector('summary')?.focus?.({ preventScroll: true });
        }, 180);
      });
    });
    return true;
  }

  // Capture phase makes this independent of the older delegated handler in app.js.
  jumpbar.addEventListener('click', (event) => {
    const button = event.target instanceof Element
      ? event.target.closest('.character-jump-button[data-character-target]')
      : null;
    if (!button || !jumpbar.contains(button)) return;
    event.preventDefault();
    event.stopPropagation();
    goToCharacter(button, true);
  }, true);

  // If a character hash is opened directly, expand that card too.
  const initialId = location.hash ? location.hash.slice(1) : '';
  if (initialId) {
    const button = buttons.find((item) => item.dataset.characterTarget === initialId);
    if (button) window.setTimeout(() => goToCharacter(button, false), 0);
  }
})();
