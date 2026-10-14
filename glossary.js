(() => {
  'use strict';

  const TERMS = window.AO_TERMS?.terms || [];
  const TERM_BY_ID = new Map(TERMS.map((term) => [term.id, term]));
  const tooltip = document.querySelector('.tooltip');
  let active = null;

  const esc = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const normalize = (value) => String(value ?? '')
    .normalize('NFKC')
    .toLocaleLowerCase('ko-KR')
    .replace(/\s+/g, ' ')
    .trim();

  function colorFor(term) {
    return term.color || 'cyan';
  }

  function linkKnownTerms(text, selfId) {
    const source = String(text || '');
    const candidates = TERMS
      .filter((term) => term.id !== selfId && String(term.name || '').startsWith('#'))
      .map((term) => ({ ...term, bare: String(term.name).slice(1) }));
    if (!candidates.length) return esc(source);

    const aliases = [];
    candidates.forEach((term) => {
      aliases.push({ text: term.name, term });
      aliases.push({ text: term.bare, term });
    });
    aliases.sort((a, b) => b.text.length - a.text.length);
    const byText = new Map(aliases.map((item) => [item.text, item.term]));
    const pattern = new RegExp(aliases
      .map((item) => item.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|'), 'g');

    let out = '';
    let cursor = 0;
    for (const match of source.matchAll(pattern)) {
      const term = byText.get(match[0]);
      if (!term) continue;
      out += esc(source.slice(cursor, match.index));
      out += `<button type="button" class="term-link" data-term="${esc(term.id)}" data-color="${esc(colorFor(term))}">${esc(term.name)}</button>`;
      cursor = match.index + match[0].length;
    }
    out += esc(source.slice(cursor));
    return out;
  }

  function renderText(text, selfId) {
    return String(text || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => `<p>${linkKnownTerms(line, selfId)}</p>`)
      .join('');
  }

  function termCard(term) {
    const searchText = normalize([
      term.name,
      term.category,
      ...(term.sections || []).map((section) => `${section.label} ${section.text}`)
    ].join(' '));

    return `<article class="glossary-card" id="${esc(term.id)}" data-search="${esc(searchText)}">
      <header class="glossary-card-heading">
        <span class="glossary-number">${String(term.number).padStart(2, '0')}</span>
        <div>
          <small>${esc(term.category)}</small>
          <h2 data-color="${esc(colorFor(term))}">${esc(['ap', 'us', 'ct'].includes(term.id) && !String(term.name).startsWith('#') ? `#${term.name}` : term.name)}</h2>
        </div>
      </header>
      <div class="glossary-card-body">
        ${(term.sections || []).map((section, index) => `<section class="glossary-definition${index === 0 ? ' primary' : ''}">
          <h3>${esc(section.label)}</h3>
          <div>${renderText(section.text, term.id)}</div>
        </section>`).join('')}
      </div>
    </article>`;
  }

  function groupedTerms() {
    const groups = new Map();
    TERMS.forEach((term) => {
      if (!groups.has(term.category)) groups.set(term.category, []);
      groups.get(term.category).push(term);
    });

    return [...groups.entries()].map(([category, terms]) => `<section class="glossary-group" data-category="${esc(category)}">
      <header class="glossary-group-heading"><span>${esc(category)}</span><b>${terms.length}</b></header>
      <div class="glossary-grid">${terms.map(termCard).join('')}</div>
    </section>`).join('');
  }

  function definition(term) {
    return term?.sections?.find((section) => section.label === '정의 및 효과 설명')?.text
      || term?.sections?.[0]?.text
      || '';
  }

  function place(target) {
    const rect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - tooltipRect.width - 12));
    let top = rect.top - tooltipRect.height - 10;
    if (top < 10) top = rect.bottom + 10;
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function show(target) {
    const term = TERM_BY_ID.get(target.dataset.term);
    if (!term) return;
    active = target;
    tooltip.innerHTML = `<div class="tooltip-category">${esc(term.category)}</div><h3>${esc(term.name)}</h3><p>${esc(definition(term)).replaceAll('\n', '<br>')}</p>`;
    tooltip.classList.add('visible');
    tooltip.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => place(target));
  }

  function hide() {
    active = null;
    tooltip.classList.remove('visible');
    tooltip.setAttribute('aria-hidden', 'true');
  }

  const list = document.getElementById('glossary-list');
  const count = document.getElementById('glossary-count');
  list.innerHTML = groupedTerms();
  [...list.querySelectorAll('.glossary-card')].forEach((card, index) => {
    const number = card.querySelector('.glossary-number');
    if (number) number.textContent = String(index + 1).padStart(2, '0');
  });
  count.textContent = TERMS.length;

  const input = document.getElementById('glossary-search');
  const empty = document.getElementById('glossary-empty');
  let searchScrollTimer = 0;
  function applySearch() {
    const query = normalize(input.value).split(' ').filter(Boolean);
    const cards = [...document.querySelectorAll('.glossary-card')];
    const groups = [...document.querySelectorAll('.glossary-group')];
    let visible = 0;
    let firstVisible = null;

    cards.forEach((card) => {
      const match = query.length === 0 || query.every((term) => card.dataset.search.includes(term));
      card.hidden = !match;
      if (match) {
        visible += 1;
        if (!firstVisible) firstVisible = card;
      }
    });
    groups.forEach((group) => {
      group.hidden = !group.querySelector('.glossary-card:not([hidden])');
    });
    count.textContent = visible;
    empty.hidden = visible !== 0;

    window.clearTimeout(searchScrollTimer);
    if (query.length && firstVisible) {
      searchScrollTimer = window.setTimeout(() => {
        requestAnimationFrame(() => {
          const top = firstVisible.getBoundingClientRect().top + window.scrollY - 88;
          window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        });
      }, 120);
    }
  }
  input.addEventListener('input', applySearch);
  applySearch();

  document.addEventListener('pointerover', (event) => {
    const target = event.target.closest('.term-link');
    if (target && event.pointerType !== 'touch') show(target);
  });
  document.addEventListener('pointerout', (event) => {
    if (event.target.closest('.term-link') && event.pointerType !== 'touch') hide();
  });
  document.addEventListener('click', (event) => {
    const target = event.target.closest('.term-link');
    if (target) {
      event.preventDefault();
      active === target ? hide() : show(target);
    } else if (!event.target.closest('.tooltip')) {
      hide();
    }
  });
  window.addEventListener('scroll', () => { if (active) place(active); }, { passive: true });
  window.addEventListener('resize', () => { if (active) place(active); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') hide(); });
})();
