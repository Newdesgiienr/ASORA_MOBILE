(() => {
  'use strict';
  const root = document.querySelector('.rules-page');
  const toolbar = document.querySelector('.temp-toolbar');
  const marks = Array.from(document.querySelectorAll('[data-temporary]'));
  const count = document.getElementById('temp-count');
  const header = document.querySelector('.app-topbar');
  const find = document.getElementById('temp-find');
  const previous = document.getElementById('temp-prev');
  const next = document.getElementById('temp-next');
  if (!root || !toolbar || !count || !find || !previous || !next) return;
  const controls = document.getElementById('temp-controls');
  const close = document.getElementById('temp-close');
  let active = -1;
  let enabled = false;
  controls.hidden = true;
  const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function measure() {
    const headHeight = Math.ceil(header?.getBoundingClientRect().height || 0);
    root.style.setProperty('--rules-header-height', `${headHeight + 8}px`);
    root.style.setProperty('--rules-scroll-offset', `${headHeight + toolbar.getBoundingClientRect().height + 30}px`);
  }
  function move(direction) {
    if (!enabled || !marks.length) return;
    if (active >= 0) {
      marks[active].classList.remove('is-current');
      marks[active].closest('.combat-memo-row')?.classList.remove('temp-current-row');
      marks[active].removeAttribute('aria-current');
    }
    active = active < 0 ? (direction < 0 ? marks.length - 1 : 0) : (active + direction + marks.length) % marks.length;
    const mark = marks[active];
    mark.classList.add('is-current');
    mark.closest('.combat-memo-row')?.classList.add('temp-current-row');
    mark.setAttribute('aria-current', 'true');
    count.textContent = `${active + 1} / ${marks.length}`;
    measure();
    mark.scrollIntoView({behavior: reduced() ? 'auto' : 'smooth', block: 'start'});
    // Keep focus on the toolbar button for repeated keyboard navigation.
  }
  find.addEventListener('click', () => {
    if (!marks.length) return;
    enabled = true; controls.hidden = false; find.setAttribute('aria-expanded', 'true'); move(1);
  });
  close.addEventListener('click', () => {
    enabled = false; controls.hidden = true; find.setAttribute('aria-expanded', 'false');
    if (active >= 0) { marks[active].classList.remove('is-current'); marks[active].closest('.combat-memo-row')?.classList.remove('temp-current-row'); marks[active].removeAttribute('aria-current'); }
    active = -1; count.textContent = `0 / ${marks.length}`; measure(); find.focus();
  });
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  count.textContent = `0 / ${marks.length}`;
  for (const button of [find, previous, next]) button.disabled = !marks.length;
  toolbar.hidden = false;
  measure();
  window.addEventListener('resize', measure);
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(measure);
    if (header) observer.observe(header);
    observer.observe(toolbar);
  }
})();
