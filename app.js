(() => {
  'use strict';

  const TERM_LIST = window.AO_TERMS?.terms || [];
  const TERMS = new Map(TERM_LIST.map((term) => [term.id, term]));
  const tooltip = document.querySelector('.tooltip');
  let activeTooltip = null;

  const esc = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  function definition(term) {
    return term?.sections?.find((section) => section.label === '정의 및 효과 설명')?.text
      || term?.sections?.[0]?.text
      || '';
  }

  // 한 번 용어사전에 등록된 #키워드는 이후 본문에서 # 입력 여부와 관계없이 자동으로 강조합니다.
  const AUTO_TERMS = TERM_LIST
    .filter((term) => String(term.name || '').startsWith('#'))
    .map((term) => ({ ...term, bare: String(term.name).slice(1) }))
    .sort((a, b) => b.bare.length - a.bare.length);

  function autoLinkGlossaryTerms() {
    if (!AUTO_TERMS.length) return;

    // 같은 정보 칸 안에서 같은 용어가 반복될 경우 첫 번째 항목에만 툴팁을 연결합니다.
    // data-auto-terms="off"가 지정된 칸은 용어를 일반 텍스트로 유지합니다.
    const targets = document.querySelectorAll('.row-body, .potential-detail, .domain-effects, .domain-condition');
    const aliases = [];
    AUTO_TERMS.forEach((term) => {
      aliases.push({ text: term.name, term });
      aliases.push({ text: term.bare, term });
    });
    aliases.sort((a, b) => b.text.length - a.text.length);
    const aliasMap = new Map(aliases.map((item) => [item.text, item.term]));
    const pattern = new RegExp(aliases.map((item) => item.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');

    targets.forEach((target) => {
      if (target.dataset.autoTerms === 'off') return;

      const usedTerms = new Set();
      // 기존에 수동으로 연결된 용어도 같은 칸에서는 첫 항목만 유지합니다.
      target.querySelectorAll('.term-link[data-term]').forEach((link) => {
        const termId = link.dataset.term;
        if (!termId) return;
        if (usedTerms.has(termId)) {
          link.replaceWith(document.createTextNode(link.textContent || ''));
        } else {
          usedTerms.add(termId);
        }
      });

      const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);

      nodes.forEach((node) => {
        if (!node.nodeValue?.trim()) return;
        if (node.parentElement?.closest('.term-link, .search-match, script, style')) return;
        const source = node.nodeValue;
        pattern.lastIndex = 0;
        if (!pattern.test(source)) return;
        pattern.lastIndex = 0;

        const fragment = document.createDocumentFragment();
        let cursor = 0;
        for (const match of source.matchAll(pattern)) {
          const term = aliasMap.get(match[0]);
          if (!term) continue;
          fragment.append(document.createTextNode(source.slice(cursor, match.index)));

          if (usedTerms.has(term.id)) {
            // 반복 용어는 # 표기만 통일하고 일반 텍스트로 둡니다.
            fragment.append(document.createTextNode(term.name));
          } else {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'term-link';
            button.dataset.term = term.id;
            button.textContent = term.name;
            fragment.append(button);
            usedTerms.add(term.id);
          }
          cursor = match.index + match[0].length;
        }
        fragment.append(document.createTextNode(source.slice(cursor)));
        node.replaceWith(fragment);
      });
    });
  }

  function placeTooltip(target) {
    if (!tooltip) return;
    const rect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - tooltipRect.width - 12));
    let top = rect.top - tooltipRect.height - 10;
    if (top < 10) top = rect.bottom + 10;
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function showTooltip(target) {
    if (!tooltip) return;
    const term = TERMS.get(target.dataset.term);
    if (!term) return;
    activeTooltip = target;
    tooltip.innerHTML = `<div class="tooltip-category">${esc(term.category)}</div><h3>${esc(term.name)}</h3><p>${esc(definition(term)).replaceAll('\n', '<br>')}</p>`;
    tooltip.classList.add('visible');
    tooltip.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => placeTooltip(target));
  }

  function hideTooltip() {
    if (!tooltip) return;
    activeTooltip = null;
    tooltip.classList.remove('visible');
    tooltip.setAttribute('aria-hidden', 'true');
  }

  // 초기 화면을 먼저 즉시 그린 뒤 용어 자동 링크 처리는 유휴 시간에 실행합니다.
  // 캐릭터 수가 늘어나도 상단 초상화 바와 카드 목록이 늦게 나타나지 않게 합니다.
  const scheduleAutoLinkGlossaryTerms = () => {
    const run = () => {
      autoLinkGlossaryTerms();
      searchable?.clear?.();
      if (typeof applyFilters === 'function' && document.getElementById('character-search')?.value?.trim()) {
        applyFilters();
      }
    };
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(run, { timeout: 1200 });
    } else {
      window.setTimeout(run, 0);
    }
  };
  scheduleAutoLinkGlossaryTerms();

  document.addEventListener('pointerover', (event) => {
    const target = event.target.closest('.term-link');
    if (target && event.pointerType !== 'touch') showTooltip(target);
  });
  document.addEventListener('pointerout', (event) => {
    if (event.target.closest('.term-link') && event.pointerType !== 'touch') hideTooltip();
  });
  document.addEventListener('click', (event) => {
    const target = event.target.closest('.term-link');
    if (target) {
      event.preventDefault();
      activeTooltip === target ? hideTooltip() : showTooltip(target);
    } else if (!event.target.closest('.tooltip')) {
      hideTooltip();
    }
  });
  window.addEventListener('scroll', () => { if (activeTooltip) placeTooltip(activeTooltip); }, { passive: true });
  window.addEventListener('resize', () => { if (activeTooltip) placeTooltip(activeTooltip); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') hideTooltip(); });

  document.querySelectorAll('.section-nav button').forEach((button) => {
    button.addEventListener('click', () => {
      const target = document.getElementById(button.dataset.target);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // 캐릭터는 속성별로 자동 그룹화합니다. 앞으로 캐릭터 카드가 추가되어도
  // data-element 값만 지정하면 같은 속성끼리 한 묶음으로 정렬됩니다.
  const ATTRIBUTE_GROUPS = [
    { id: 'caelum', label: '카에룸', icon: 'assets/caelum.png' },
    { id: 'chaos', label: '카오스', icon: 'assets/chaos.png' },
    { id: 'homines', label: '호미네스', icon: 'assets/homines.png' },
    { id: 'nox', label: '녹스', icon: 'assets/nox.png' },
    { id: 'lux', label: '룩스', icon: 'assets/lux.png' },
    { id: 'terra', label: '테라', icon: 'assets/terra.png' }
  ];

  function sortCharactersByAttribute() {
    const list = document.getElementById('character-list');
    if (!list) return;

    const cards = [...list.querySelectorAll(':scope > .character-card')];
    if (!cards.length) return;

    const order = new Map(ATTRIBUTE_GROUPS.map((attribute, index) => [attribute.id, index]));
    cards
      .map((card, index) => ({ card, index }))
      .sort((left, right) => {
        const leftOrder = order.has(left.card.dataset.element) ? order.get(left.card.dataset.element) : ATTRIBUTE_GROUPS.length;
        const rightOrder = order.has(right.card.dataset.element) ? order.get(right.card.dataset.element) : ATTRIBUTE_GROUPS.length;
        return leftOrder - rightOrder || left.index - right.index;
      })
      .forEach(({ card }) => list.append(card));
  }

  // HTML에서 이미 속성 순으로 정렬되어 있으므로 초기 로드 시 DOM 재배치를 하지 않습니다.

  const cards = [...document.querySelectorAll('.character-card')];
  cards.forEach((card) => { card.open = false; });
  document.getElementById('expand-all')?.addEventListener('click', () => {
    cards.filter((card) => !card.hidden).forEach((card) => { card.open = true; });
  });
  document.getElementById('collapse-all')?.addEventListener('click', () => {
    cards.filter((card) => !card.hidden).forEach((card) => { card.open = false; });
  });

  const search = document.getElementById('character-search');
  const count = document.getElementById('character-count');
  const empty = document.getElementById('character-empty');
  const reset = document.getElementById('reset-filters');
  const filterButtons = [...document.querySelectorAll('.filter-icon-button[data-filter-group]')];
  const selected = { element: new Set(), role: new Set() };
  const searchable = new Map();
  function getSearchableText(card) {
    if (searchable.has(card)) return searchable.get(card);
    const linkedTermIds = new Set([...card.querySelectorAll('[data-term]')].map((node) => node.dataset.term).filter(Boolean));
    const glossaryText = [...linkedTermIds].map((id) => {
      const term = TERMS.get(id);
      return term ? `${term.name || ''} ${definition(term)}` : '';
    }).join(' ');
    const value = `${card.textContent || ''} ${glossaryText}`.toLocaleLowerCase('ko-KR');
    searchable.set(card, value);
    return value;
  }
  const jumpbar = document.getElementById('character-jumpbar');

  // 상단 초상화 레일: 터치는 브라우저의 네이티브 가로 스크롤을 그대로 사용하고,
  // 마우스/펜만 직접 드래그합니다. 이렇게 해야 모바일의 관성 스와이프가 끊기지 않습니다.
  // 또한 이미지/링크의 기본 드래그를 막아 초상화 위에서 시작해도 스와이프가 안정적으로 동작합니다.
  let jumpGesture = null;
  let suppressJumpClickUntil = 0;
  const SWIPE_THRESHOLD = 5;

  function openCharacterFromJump(button) {
    const targetId = button?.dataset?.characterTarget || '';
    const card = document.getElementById(targetId);
    if (!card) return;

    // 초상화 바로가기는 검색/필터 상태와 무관하게 항상 해당 캐릭터를 보여 줍니다.
    if (search) search.value = '';
    selected.element.clear();
    selected.role.clear();
    filterButtons.forEach((filterButton) => {
      filterButton.classList.remove('active');
      filterButton.setAttribute('aria-pressed', 'false');
    });
    applyFilters();

    // 다른 캐릭터는 접고 선택한 캐릭터만 펼칩니다.
    cards.forEach((item) => {
      item.hidden = false;
      item.open = item === card;
    });
    card.hidden = false;
    card.open = true;

    // 선택된 초상화 표시.
    jumpbar?.querySelectorAll('.character-jump-button').forEach((item) => {
      const current = item === button;
      item.classList.toggle('is-current', current);
      if (current) item.setAttribute('aria-current', 'true');
      else item.removeAttribute('aria-current');
    });

    // URL 해시도 맞춰 두되, 브라우저의 선행 기본 점프는 발생시키지 않습니다.
    if (window.history?.replaceState) {
      window.history.replaceState(null, '', `#${targetId}`);
    }

    // details를 먼저 확실히 펼친 다음 카드 상단으로 이동합니다.
    void card.offsetHeight;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        card.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      });
    });
  }

  jumpbar?.addEventListener('dragstart', (event) => {
    // img/a의 기본 ghost drag가 가로 스와이프를 빼앗지 않도록 합니다.
    event.preventDefault();
  });

  jumpbar?.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const button = event.target instanceof Element
      ? event.target.closest('.character-jump-button[data-character-target]')
      : null;

    jumpGesture = {
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      button: button && jumpbar.contains(button) ? button : null,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      startScrollLeft: jumpbar.scrollLeft,
      moved: false,
      captured: false
    };
  });

  jumpbar?.addEventListener('pointermove', (event) => {
    if (!jumpGesture || jumpGesture.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - jumpGesture.startX;
    const deltaY = event.clientY - jumpGesture.startY;

    if (!jumpGesture.moved && Math.abs(deltaX) >= SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
      jumpGesture.moved = true;
      jumpbar.classList.add('is-dragging');

      // 터치는 네이티브 overflow 스크롤 + 관성에 맡깁니다.
      // 마우스/펜만 pointer capture 후 scrollLeft를 직접 이동합니다.
      if (jumpGesture.pointerType !== 'touch') {
        try {
          jumpbar.setPointerCapture?.(event.pointerId);
          jumpGesture.captured = true;
        } catch (_) {}
      }
    }

    if (jumpGesture.moved && jumpGesture.pointerType !== 'touch') {
      jumpbar.scrollLeft = jumpGesture.startScrollLeft - deltaX;
      event.preventDefault();
    }
    jumpGesture.lastX = event.clientX;
  }, { passive: false });

  function finishJumpGesture(event, cancelled = false) {
    if (!jumpGesture || jumpGesture.pointerId !== event.pointerId) return;
    const gesture = jumpGesture;
    jumpGesture = null;
    jumpbar?.classList.remove('is-dragging');

    if (gesture.captured) {
      try { jumpbar?.releasePointerCapture?.(event.pointerId); } catch (_) {}
    }

    if (gesture.moved || cancelled) {
      // 터치 브라우저의 delayed click까지 충분히 막습니다.
      suppressJumpClickUntil = performance.now() + 500;
      return;
    }

    if (gesture.button) {
      event.preventDefault();
      suppressJumpClickUntil = performance.now() + 350;
      openCharacterFromJump(gesture.button);
    }
  }

  jumpbar?.addEventListener('pointerup', (event) => finishJumpGesture(event, false));
  jumpbar?.addEventListener('pointercancel', (event) => finishJumpGesture(event, true));

  // 키보드 Enter/Space, 또는 pointer 이벤트를 거치지 않는 click을 위한 fallback.
  jumpbar?.addEventListener('click', (event) => {
    if (performance.now() < suppressJumpClickUntil) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const button = event.target instanceof Element
      ? event.target.closest('.character-jump-button[data-character-target]')
      : null;
    if (!button || !jumpbar.contains(button)) return;
    event.preventDefault();
    openCharacterFromJump(button);
  });

  // #character-xxx뿐 아니라 #skill-xxx 주소로 들어온 경우에도 소속 캐릭터를 펼칩니다.
  // 아티팩트의 강화 스킬 링크에서 해당 스킬 설명으로 바로 연결하기 위한 처리입니다.
  const initialCharacterId = window.location.hash ? window.location.hash.slice(1) : '';
  if (initialCharacterId) {
    const initialButton = jumpbar?.querySelector(
      `.character-jump-button[data-character-target="${CSS.escape(initialCharacterId)}"]`
    );
    if (initialButton) {
      window.setTimeout(() => openCharacterFromJump(initialButton), 0);
    } else {
      const deepTarget = document.getElementById(initialCharacterId);
      const ownerCard = deepTarget?.closest?.('details.character-card');
      if (deepTarget && ownerCard) {
        window.setTimeout(() => {
          if (search) search.value = '';
          selected.element.clear();
          selected.role.clear();
          filterButtons.forEach((filterButton) => {
            filterButton.classList.remove('active');
            filterButton.setAttribute('aria-pressed', 'false');
          });
          applyFilters();
          cards.forEach((card) => {
            card.hidden = false;
            card.open = card === ownerCard;
          });
          ownerCard.open = true;
          const ownerButton = jumpbar?.querySelector(
            `.character-jump-button[data-character-target="${CSS.escape(ownerCard.id)}"]`
          );
          jumpbar?.querySelectorAll('.character-jump-button').forEach((button) => {
            const current = button === ownerButton;
            button.classList.toggle('is-current', current);
            if (current) button.setAttribute('aria-current', 'true');
            else button.removeAttribute('aria-current');
          });
          deepTarget.classList.add('deep-link-target');
          void ownerCard.offsetHeight;
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              deepTarget.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'nearest' });
            });
          });
        }, 0);
      }
    }
  }

  const SEARCH_HIGHLIGHT_NAME = 'character-search-match';

  function unwrapFallbackHighlights() {
    document.querySelectorAll('mark.search-match').forEach((mark) => {
      const parent = mark.parentNode;
      mark.replaceWith(document.createTextNode(mark.textContent || ''));
      parent?.normalize?.();
    });
    document.querySelectorAll('.term-link.search-match-term').forEach((link) => {
      link.classList.remove('search-match-term');
    });
  }

  function clearSearchHighlights() {
    if (window.CSS?.highlights?.delete) {
      window.CSS.highlights.delete(SEARCH_HIGHLIGHT_NAME);
    }
    unwrapFallbackHighlights();
  }

  function normalizedSearchTerms(queryTerms) {
    return [...new Set((queryTerms || [])
      .map((term) => String(term || '').toLocaleLowerCase('ko-KR').trim())
      .filter(Boolean))]
      .sort((a, b) => b.length - a.length);
  }

  function collectSearchRanges(queryTerms) {
    const terms = normalizedSearchTerms(queryTerms);
    if (!terms.length) return [];
    const ranges = [];

    cards.filter((card) => !card.hidden).forEach((card) => {
      const content = card.querySelector('.character-content');
      if (!content) return;

      const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
          if (node.parentElement?.closest('script, style')) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });

      while (walker.nextNode()) {
        const node = walker.currentNode;
        const source = node.nodeValue || '';
        const lower = source.toLocaleLowerCase('ko-KR');
        if (!lower.trim()) continue;

        terms.forEach((term) => {
          let from = 0;
          while (from <= lower.length - term.length) {
            const index = lower.indexOf(term, from);
            if (index < 0) break;
            const range = document.createRange();
            range.setStart(node, index);
            range.setEnd(node, index + term.length);
            ranges.push(range);
            from = index + Math.max(1, term.length);
          }
        });
      }
    });

    return ranges;
  }

  function fallbackHighlightSearchTerms(queryTerms) {
    const terms = normalizedSearchTerms(queryTerms);
    if (!terms.length) return;
    const pattern = new RegExp(`(${terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');

    cards.filter((card) => !card.hidden).forEach((card) => {
      const content = card.querySelector('.character-content');
      if (!content) return;
      const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
          if (node.parentElement?.closest('script, style, .search-match')) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);

      nodes.forEach((node) => {
        const source = node.nodeValue || '';
        pattern.lastIndex = 0;
        if (!pattern.test(source)) return;
        pattern.lastIndex = 0;
        const fragment = document.createDocumentFragment();
        let cursor = 0;
        for (const match of source.matchAll(pattern)) {
          fragment.append(document.createTextNode(source.slice(cursor, match.index)));
          const mark = document.createElement('mark');
          mark.className = 'search-match';
          mark.textContent = match[0];
          fragment.append(mark);
          cursor = match.index + match[0].length;
        }
        fragment.append(document.createTextNode(source.slice(cursor)));
        node.replaceWith(fragment);
      });
    });
  }

  function highlightSearchTerms(queryTerms) {
    const terms = normalizedSearchTerms(queryTerms);
    if (!terms.length) return;

    // Chrome/Edge/Safari/Firefox 최신 브라우저에서는 DOM을 건드리지 않는
    // CSS Custom Highlight API를 사용합니다. details가 닫혀 있어도 범위가 유지되므로
    // 검색 후 카드를 열었을 때 [LV 2 기준] 같은 보조 텍스트까지 즉시 강조됩니다.
    if (window.CSS?.highlights && typeof window.Highlight === 'function') {
      const ranges = collectSearchRanges(terms);
      if (ranges.length) {
        window.CSS.highlights.set(SEARCH_HIGHLIGHT_NAME, new window.Highlight(...ranges));
      }
      return;
    }

    // 구형 브라우저용 fallback.
    fallbackHighlightSearchTerms(terms);
  }

  function currentSearchTerms() {
    return (search?.value || '').toLocaleLowerCase('ko-KR').trim().split(/\s+/).filter(Boolean);
  }

  // 닫힌 상태에서 검색한 카드도 열리는 즉시 현재 검색어 강조 범위를 다시 계산합니다.
  cards.forEach((card) => {
    card.addEventListener('toggle', () => {
      if (!card.open || card.hidden) return;
      const query = currentSearchTerms();
      if (!query.length) return;
      requestAnimationFrame(() => {
        clearSearchHighlights();
        highlightSearchTerms(query);
      });
    });
  });

  function applyFilters() {
    clearSearchHighlights();
    const query = currentSearchTerms();
    let visible = 0;

    cards.forEach((card) => {
      const text = query.length ? getSearchableText(card) : '';
      const searchMatch = query.length === 0 || query.every((term) => text.includes(term));
      const elementMatch = selected.element.size === 0 || selected.element.has(card.dataset.element);
      const roleMatch = selected.role.size === 0 || selected.role.has(card.dataset.role);
      const match = searchMatch && elementMatch && roleMatch;
      card.hidden = !match;
      if (match) visible += 1;
    });


    if (query.length) highlightSearchTerms(query);

    if (count) count.textContent = String(visible);
    if (empty) empty.hidden = visible !== 0;
    if (reset) {
      const showReset = selected.element.size !== 0 || selected.role.size !== 0;
      reset.classList.toggle('is-placeholder', !showReset);
      reset.disabled = !showReset;
      reset.setAttribute('aria-hidden', showReset ? 'false' : 'true');
    }
  }

  search?.addEventListener('input', applyFilters);

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const group = button.dataset.filterGroup;
      const value = button.dataset.filterValue;
      const set = selected[group];
      if (!set) return;
      if (set.has(value)) set.delete(value);
      else set.add(value);
      const isActive = set.has(value);
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
      applyFilters();
    });
  });

  reset?.addEventListener('click', () => {
    selected.element.clear();
    selected.role.clear();
    filterButtons.forEach((button) => {
      button.classList.remove('active');
      button.setAttribute('aria-pressed', 'false');
    });
    applyFilters();
  });

  applyFilters();
})();
