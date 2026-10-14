(() => {
  'use strict';

  const TERM_LIST = window.AO_TERMS?.terms || [];
  const TERMS = new Map(TERM_LIST.map((term) => [term.id, term]));
  const TERM_ALIAS = { '#벚꽃 표시': 'cherry-mark', '#봉제 인형': 'plush-doll' };
  const normalizeTerm = (value) => String(value || '').replace(/\s+/g, '').replace('표시', '표식');
  const termByLabel = (label) => {
    const alias = TERM_ALIAS[label];
    if (alias && TERMS.has(alias)) return TERMS.get(alias);
    const normalized = normalizeTerm(label);
    return TERM_LIST.find((term) => normalizeTerm(term.name) === normalized) || null;
  };

  const ROLE_INFO = {
    defender: { name: '디펜더', icon: 'assets/defender.png' },
    anchor: { name: '앵커', icon: 'assets/anchor.png' },
    supporter: { name: '서포터', icon: 'assets/supporter.png' },
    breaker: { name: '브레이커', icon: 'assets/breaker.png' },
    attacker: { name: '어태커', icon: 'assets/attacker.png' },
    sweeper: { name: '스위퍼', icon: 'assets/sweeper.png' }
  };

  const ELEMENT_INFO = {
    caelum: { name: '카에룸', icon: 'assets/caelum.png' },
    homines: { name: '호미네스', icon: 'assets/homines.png' },
    nox: { name: '녹스', icon: 'assets/nox.png' },
    terra: { name: '테라', icon: 'assets/terra.png' },
    lux: { name: '룩스', icon: 'assets/lux.png' }
  };

  const elementHtml = (key) => {
    const element = ELEMENT_INFO[key];
    return `<span class="artifact-inline-element"><span class="artifact-inline-icon"><img alt="${element.name}" src="${element.icon}"/></span><span>${element.name}</span></span>`;
  };
  const termHtml = (label) => {
    const term = termByLabel(label);
    if (!term) return `<span class="artifact-effect-term">${label}</span>`;
    return `<button type="button" class="term-link artifact-effect-term" data-term="${term.id}" data-color="${term.color || 'cyan'}">${label}</button>`;
  };
  const linkedSkill = (name, bonus, owner, portrait, href) => ({ name, bonus, owner, ownerPortrait: portrait, href });
  const genericSkill = (bonus = '+Lv.1') => ({ name: '얼티메이트 스킬', bonus, owner: '', ownerPortrait: 'assets/artifacts/video/ultimate-generic.jpg', href: '' });

  // CBT 영상에서 확인된 스탯 종류만 기록하고, 수치는 정식 출시 후 N / N% 자리에 채웁니다.
  const ARTIFACTS = [
    {
      id: 'arilleus-spear', name: '아킬레우스의 창', grade: 'SR', role: 'attacker',
      image: 'assets/artifacts/video/arilleus-spear.jpg', imageAlt: '아킬레우스의 창 아티팩트 이미지',
      stats: [{name:'공격력',value:'N'},{name:'타격력',value:'N'},{name:'치명타 피해',value:'N%'}],
      effects: [
        {html:`착용자의 ${elementHtml('caelum')} 속성 공격력 <strong>15%</strong> 증가<br>치명타 확률 <strong>+5%</strong>`, search:'착용자의 카에룸 속성 공격력 15% 증가 치명타 확률 +5%'},
        {html:`착용자가 ${termHtml('#적중된 창')} 3개 부여 시마다 ${termHtml('#연쇄')} 1중첩 부여`, search:'착용자가 적중된 창 3개 부여 시마다 연쇄 1중첩 부여'}
      ],
      skill: linkedSkill('아틀레트리아의 일격','+Lv.2','아사쿠라 마이','assets/cards/mai.webp','characters.html#skill-mai-athletria-strike')
    },
    {
      id: 'phase-magic-scroll-folder', name: '위상 마법 스크롤 폴더', grade: 'SR', role: 'defender',
      image: 'assets/artifacts/video/phase-magic-scroll-folder.jpg', imageAlt: '위상 마법 스크롤 폴더 아티팩트 이미지',
      stats: [{name:'공격력',value:'N'},{name:'타격력',value:'N'},{name:'공격력',value:'N%'}],
      effects: [
        {html:`착용자의 ${elementHtml('homines')} 속성 공격력 <strong>10%</strong> 증가`, search:'착용자의 호미네스 속성 공격력 10% 증가'},
        {html:'착용자가 스킬 사용 시마다 US 포인트 <strong>+200</strong>', search:'착용자가 스킬 사용 시마다 US 포인트 +200'}
      ],
      skill: linkedSkill('바이어슈트라스의 위상 방벽','+Lv.2','타카라베 치카게','assets/cards/chikage.webp','characters.html#skill-chikage-weierstrass-phase-barrier')
    },
    {
      id: 'repin-de-justis', name: '레핀 드 쥐스티스', grade: 'SSR', role: 'breaker',
      image: 'assets/artifacts/video/repin-de-justis.jpg', imageAlt: '레핀 드 쥐스티스 아티팩트 이미지',
      stats: [{name:'공격력',value:'N'},{name:'타격력',value:'N'},{name:'US포인트 회복',value:'N%'}],
      effects: [
        {html:`착용자의 ${elementHtml('caelum')} 속성 공격력 <strong>20%</strong> 증가`, search:'착용자의 카에룸 속성 공격력 20% 증가'},
        {html:`착용자가 ${termHtml('#강습 차단')} 성공 시 공격력 <strong>20%</strong> 증가 <span class="artifact-effect-note">(유지 라운드 1)</span>`, search:'착용자가 강습 차단 성공 시 공격력 20% 증가 유지 라운드 1'}
      ],
      skill: linkedSkill('레핀 드 쥐스티스','+Lv.2','하나모리 모아','assets/cards/moa.webp','characters.html#skill-moa-repin-de-justis')
    },
    {
      id: 'harumu', name: '하쿠무', grade: 'SSR', role: 'sweeper',
      image: 'assets/artifacts/video/harumu.jpg', imageAlt: '하쿠무 아티팩트 이미지',
      stats: [{name:'공격력',value:'N'},{name:'타격력',value:'N'},{name:'US포인트 회복',value:'N%'}],
      effects: [
        {html:`착용자의 ${elementHtml('nox')} 속성 공격력 <strong>20%</strong> 증가`, search:'착용자의 녹스 속성 공격력 20% 증가'},
        {html:'착용자의 치명타 확률 <strong>+10%</strong>', search:'착용자의 치명타 확률 +10%'},
        {html:`착용자가 ${termHtml('#벚꽃 표시')} 부여 시마다 치명타 피해 <strong>10%</strong> 증가`, search:'착용자가 벚꽃 표시 부여 시마다 치명타 피해 10% 증가'}
      ],
      skill: linkedSkill('우구이스카구라의 춤사위','+Lv.2','나가타니 카논','assets/cards/canon.webp','characters.html#skill-canon-uguisukagura-dance')
    },
    {
      id: 'mareng-report', name: '마랭 보고서', grade: 'SR', role: 'attacker',
      image: 'assets/artifacts/video/mareng-report.jpg', imageAlt: '마랭 보고서 아티팩트 이미지',
      stats: [{name:'공격력',value:'N'},{name:'타격력',value:'N'},{name:'치명타 확률',value:'N%'}],
      effects: [
        {html:'착용자의 공격력 <strong>5%</strong>, 치명타 피해 <strong>15%</strong> 증가', search:'착용자의 공격력 5% 치명타 피해 15% 증가'},
        {html:'착용자가 태그 스킬 사용 시 치명타 피해 <strong>21%</strong> 증가 <span class="artifact-effect-note">(유지 라운드 1)</span>', search:'착용자가 태그 스킬 사용 시 치명타 피해 21% 증가 유지 라운드 1'}
      ], skill: genericSkill()
    },
    {
      id: 'clew-solus-branch', name: '클리우 솔러시의 가지', grade: 'SR', role: 'breaker',
      image: 'assets/artifacts/video/clew-solus-branch.jpg', imageAlt: '클리우 솔러시의 가지 아티팩트 이미지',
      stats: [{name:'공격력',value:'N'},{name:'타격력',value:'N'},{name:'타격력',value:'N%'}],
      effects: [
        {html:`착용자의 ${elementHtml('homines')} 속성 공격력 <strong>10%</strong> 증가`, search:'착용자의 호미네스 속성 공격력 10% 증가'},
        {html:`착용자가 ${termHtml('#강습 차단')} 성공 시 AP <strong>+1</strong>`, search:'착용자가 강습 차단 성공 시 AP +1'}
      ],
      skill: linkedSkill('클리우 솔러시','+Lv.2','타나카 에린','assets/cards/erin.webp','characters.html#skill-erin-clew-solus')
    },
    {
      id: 'shion-my-bag', name: '시온의 마이 백', grade: 'SR', role: 'breaker',
      image: 'assets/artifacts/video/shion-my-bag.jpg', imageAlt: '시온의 마이 백 아티팩트 이미지',
      stats: [{name:'공격력',value:'N'},{name:'타격력',value:'N'},{name:'치명타 피해',value:'N%'}],
      effects: [
        {html:`착용자의 ${elementHtml('nox')} 속성 공격력 <strong>10%</strong> 증가`, search:'착용자의 녹스 속성 공격력 10% 증가'},
        {html:`착용자가 ${termHtml('#봉제 인형')} 1개 소모 시마다 US 포인트 <strong>+150</strong>`, search:'착용자가 봉제 인형 1개 소모 시마다 US 포인트 +150'}
      ],
      skill: linkedSkill('가방 속의 폭풍','+Lv.2','노와타리 시온','assets/cards/shion.webp','characters.html#skill-shion-storm-in-bag')
    },
    {
      id: 'ken-aruk-sword', name: '켄 아록의 검', grade: 'SR', role: 'attacker',
      image: 'assets/artifacts/video/ken-aruk-sword.jpg', imageAlt: '켄 아록의 검 아티팩트 이미지',
      stats: [{name:'공격력',value:'N'},{name:'타격력',value:'N'},{name:'공격력',value:'N%'}],
      effects: [
        {html:`착용자의 ${elementHtml('nox')} 속성 공격력 <strong>10%</strong> 증가`, search:'착용자의 녹스 속성 공격력 10% 증가'},
        {html:`착용자가 얼티메이트 스킬 사용 시 대상에게 ${termHtml('#저주')} 3중첩 부여`, search:'착용자가 얼티메이트 스킬 사용 시 대상에게 저주 3중첩 부여'}
      ],
      skill: linkedSkill('켄 아록의 검','+Lv.2','시라누이 렌','assets/cards/ren.webp','characters.html#skill-ren-ken-arok-sword')
    },
    {
      id: 'honorius-oath-book', name: '호노리우스의 맹세의 서', grade: 'SR', role: 'sweeper',
      image: 'assets/artifacts/video/honorius-oath-book.jpg', imageAlt: '호노리우스의 맹세의 서 아티팩트 이미지',
      stats: [{name:'공격력',value:'N'},{name:'타격력',value:'N'},{name:'치명타 확률',value:'N%'}],
      effects: [
        {html:'착용자의 공격력 <strong>5%</strong>, 치명타 확률 <strong>7.5%</strong> 증가', search:'착용자의 공격력 5% 치명타 확률 7.5% 증가'},
        {html:'착용자가 태그 스킬 사용 시 치명타 확률 <strong>10.5%</strong> 증가 <span class="artifact-effect-note">(유지 라운드 1)</span>', search:'착용자가 태그 스킬 사용 시 치명타 확률 10.5% 증가 유지 라운드 1'}
      ], skill: genericSkill()
    },
    {
      id: 'poetics-playbook', name: '시학 희극편', grade: 'SR', role: 'supporter',
      image: 'assets/artifacts/video/poetics-playbook.jpg', imageAlt: '시학 희극편 아티팩트 이미지',
      stats: [{name:'공격력',value:'N'},{name:'타격력',value:'N'},{name:'US포인트 회복',value:'N%'}],
      effects: [
        {html:'착용자의 공격력 <strong>5%</strong>, 최대 HP <strong>5%</strong> 증가', search:'착용자의 공격력 5% 최대 HP 5% 증가'},
        {html:'착용자가 태그 스킬 사용 시 치명타 피해 <strong>21%</strong> 증가 <span class="artifact-effect-note">(유지 라운드 1)</span>', search:'착용자가 태그 스킬 사용 시 치명타 피해 21% 증가 유지 라운드 1'}
      ], skill: genericSkill()
    },
    {
      id: 'foucault-pendulum', name: '푸코의 진자', grade: 'SR', role: 'anchor',
      image: 'assets/artifacts/video/foucault-pendulum.jpg', imageAlt: '푸코의 진자 아티팩트 이미지',
      stats: [{name:'공격력',value:'N'},{name:'타격력',value:'N'},{name:'방어력',value:'N%'}],
      effects: [
        {html:'착용자의 공격력 <strong>5%</strong>, 최대 HP <strong>5%</strong> 증가', search:'착용자의 공격력 5% 최대 HP 5% 증가'},
        {html:'착용자가 태그 스킬 사용 시 공격력 <strong>7%</strong> 증가 <span class="artifact-effect-note">(유지 라운드 1)</span>', search:'착용자가 태그 스킬 사용 시 공격력 7% 증가 유지 라운드 1'}
      ], skill: genericSkill()
    },
    {
      id: 'immovable-aether-crystal', name: '부동(不動)의 에테르 결정', grade: 'SSR', role: 'defender',
      image: 'assets/artifacts/video/immovable-aether-crystal.jpg', imageAlt: '부동의 에테르 결정 아티팩트 이미지',
      stats: [{name:'공격력',value:'N'},{name:'타격력',value:'N'},{name:'US포인트 회복',value:'N%'}],
      effects: [
        {html:'착용자의 최대 HP <strong>6%</strong>, 방어력 <strong>10%</strong> 증가', search:'착용자의 최대 HP 6% 방어력 10% 증가'},
        {html:'착용자가 얼티메이트 스킬 사용 시<br>전투 스킬 재사용 대기시간 <strong>-2</strong> <span class="artifact-effect-note">(유지 라운드 1)</span>', search:'착용자가 얼티메이트 스킬 사용 시 전투 스킬 재사용 대기시간 -2 유지 라운드 1'}
      ], skill: genericSkill()
    },
    {
      id: 'tower', name: '탑', grade: 'R', role: 'defender',
      image: 'assets/artifacts/video/tower.jpg', imageAlt: '탑 아티팩트 이미지',
      stats: [{name:'공격력',value:'N'},{name:'타격력',value:'N'},{name:'공격력',value:'N%'}],
      effects: [{html:'착용자의 방어력 <strong>7%</strong> 증가', search:'착용자의 방어력 7% 증가'}],
      skill: genericSkill()
    },
    {
      id: 'night', name: '밤', grade: 'R', role: 'sweeper',
      image: 'assets/artifacts/video/night.jpg', imageAlt: '밤 아티팩트 이미지',
      stats: [{name:'공격력',value:'N'},{name:'타격력',value:'N'},{name:'US포인트 회복',value:'N%'}],
      effects: [{html:'착용자의 치명타 확률 <strong>6%</strong> 증가', search:'착용자의 치명타 확률 6% 증가'}], skill: genericSkill()
    },
    {
      id: 'harmonia-necklace', name: '하르모니아의 목걸이', grade: 'SR', role: 'defender',
      image: 'assets/artifacts/video/harmonia-necklace.jpg', imageAlt: '하르모니아의 목걸이 아티팩트 이미지',
      stats: [{name:'공격력',value:'N'},{name:'타격력',value:'N'},{name:'HP',value:'N%'}],
      effects: [
        {html:'착용자의 최대 HP <strong>5%</strong>, 방어력 <strong>8.5%</strong> 증가', search:'착용자의 최대 HP 5% 방어력 8.5% 증가'},
        {html:'착용자가 태그 스킬 사용 시 방어력 <strong>12%</strong> 증가 <span class="artifact-effect-note">(유지 라운드 1)</span>', search:'착용자가 태그 스킬 사용 시 방어력 12% 증가 유지 라운드 1'}
      ], skill: genericSkill()
    },
    {
      id: 'jegudiel-box', name: '예구디엘의 상자', grade: 'SR', role: 'supporter',
      image: 'assets/artifacts/video/jegudiel-box.jpg', imageAlt: '예구디엘의 상자 아티팩트 이미지',
      stats: [{name:'공격력',value:'N'},{name:'타격력',value:'N'},{name:'공격력',value:'N%'}],
      effects: [
        {html:`착용자의 ${elementHtml('terra')} 속성 공격력 <strong>5%</strong> 증가`, search:'착용자의 테라 속성 공격력 5% 증가'},
        {html:`착용자에게 ${termHtml('#테우르기스트의 빛')} 부여 시 US 포인트 <strong>+30</strong>`, search:'착용자에게 테우르기스트의 빛 부여 시 US 포인트 +30'}
      ],
      skill: linkedSkill('예구디엘의 응급조치','+Lv.2','하이바라 노노','assets/cards/nono.webp','characters.html#skill-nono-jegudiel-first-aid')
    },
    {
      id: 'skaldgrimsson-axe', name: '스칼라그림손 도끼', grade: 'SR', role: 'sweeper',
      image: 'assets/artifacts/video/skaldgrimsson-axe.jpg', imageAlt: '스칼라그림손 도끼 아티팩트 이미지',
      stats: [{name:'공격력',value:'N'},{name:'타격력',value:'N'},{name:'치명타 피해',value:'N%'}],
      effects: [
        {html:`착용자가 ${elementHtml('caelum')} 속성일 시 공격력 <strong>10%</strong> 증가`, search:'착용자가 카에룸 속성일 시 공격력 10% 증가'},
        {html:'전투 시작 시 착용자의 US 포인트 <strong>+500</strong>', search:'전투 시작 시 착용자의 US 포인트 +500'}
      ],
      skill: linkedSkill('쇄도하는 라그나로크','+Lv.2','시그리드 울브헤른','assets/cards/sigrid.webp','characters.html#skill-sigrid-ragnarok')
    },
    {
      id: 'philosophy-wand', name: '철학의 지시봉', grade: 'SR', role: 'attacker',
      image: 'assets/artifacts/video/philosophy-wand.jpg', imageAlt: '철학의 지시봉 아티팩트 이미지',
      stats: [{name:'공격력',value:'N'},{name:'타격력',value:'N'},{name:'치명타 확률',value:'N%'}],
      effects: [
        {html:`착용자의 ${elementHtml('caelum')} 속성 공격력 <strong>10%</strong> 증가`, search:'착용자의 카에룸 속성 공격력 10% 증가'},
        {html:`착용자가 전투 스킬 6회 사용 시 ${termHtml('#그리스의 불')} 1개 충전<br>공격력 <strong>5%</strong> 증가 <span class="artifact-effect-note">(유지 라운드 1)</span>`, search:'착용자가 전투 스킬 6회 사용 시 그리스의 불 1개 충전 공격력 5% 증가 유지 라운드 1'}
      ],
      skill: linkedSkill('화학, 연금술, 그리고 폭발','+Lv.2','아키츠 아키나','assets/cards/akina.webp','characters.html#skill-akina-chemistry-alchemy-explosion')
    },
    {
      id: 'himiko-flute', name: '히미코의 무구·적(笛)', grade: 'SR', role: 'supporter',
      image: 'assets/artifacts/video/himiko-flute.jpg', imageAlt: '히미코의 무구 적 아티팩트 이미지',
      stats: [{name:'공격력',value:'N'},{name:'타격력',value:'N'},{name:'공격력',value:'N%'}],
      effects: [
        {html:`착용자의 ${elementHtml('lux')} 속성 공격력 <strong>15%</strong> 증가`, search:'착용자의 룩스 속성 공격력 15% 증가'},
        {html:'아군이 스킬 사용 시 착용자의 공격력 <strong>10%</strong> 증가 <span class="artifact-effect-note">(유지 라운드 1)</span>', search:'아군이 스킬 사용 시 착용자의 공격력 10% 증가 유지 라운드 1'}
      ],
      skill: linkedSkill('히미코의 무구·적(笛)','+Lv.2','후지와라 리리아','assets/cards/liria.webp','characters.html#skill-liria-himiko-flute')
    },
    {
      id: 'wish', name: '소원', grade: 'R', role: 'breaker', image: 'assets/artifacts/video/wish.jpg', imageAlt: '소원 아티팩트 이미지',
      stats: [{name:'공격력',value:'N'},{name:'타격력',value:'N'},{name:'US포인트 회복',value:'N%'}],
      effects: [{html:'착용자의 타격력 <strong>4%</strong> 증가',search:'착용자의 타격력 4% 증가'}], skill: genericSkill()
    },
    {
      id: 'duel-trial', name: '결투 재판', grade: 'R', role: 'attacker', image: 'assets/artifacts/video/duel-trial.jpg', imageAlt: '결투 재판 아티팩트 이미지',
      stats: [{name:'공격력',value:'N'},{name:'타격력',value:'N'},{name:'공격력',value:'N%'}],
      effects: [{html:'착용자의 치명타 피해 <strong>12%</strong> 증가',search:'착용자의 치명타 피해 12% 증가'}], skill: genericSkill()
    },
    {
      id: 'star', name: '별', grade: 'R', role: 'supporter', image: 'assets/artifacts/video/star.jpg', imageAlt: '별 아티팩트 이미지',
      stats: [{name:'공격력',value:'N'},{name:'타격력',value:'N'},{name:'공격력',value:'N%'}],
      effects: [{html:'착용자의 최대 HP <strong>4%</strong> 증가',search:'착용자의 최대 HP 4% 증가'}], skill: genericSkill()
    },
    {
      id: 'city', name: '도시', grade: 'R', role: 'anchor', image: 'assets/artifacts/video/city.jpg', imageAlt: '도시 아티팩트 이미지',
      stats: [{name:'공격력',value:'N'},{name:'타격력',value:'N'},{name:'HP',value:'N%'}],
      effects: [{html:'착용자의 최대 HP <strong>4%</strong> 증가',search:'착용자의 최대 HP 4% 증가'}], skill: genericSkill()
    },
    {
      id: 'hecate-torch', name: '헤카테의 횃불', grade: 'R', role: 'breaker', image: 'assets/artifacts/video/hecate-torch.jpg', imageAlt: '헤카테의 횃불 아티팩트 이미지',
      stats: [{name:'공격력',value:'N'},{name:'타격력',value:'N'},{name:'치명타 피해',value:'N%'}],
      effects: [{html:'착용자의 치명타 확률 <strong>6%</strong> 증가',search:'착용자의 치명타 확률 6% 증가'}], skill: genericSkill()
    },
    {
      id: 'maze-key', name: '미로의 열쇠', grade: 'R', role: 'supporter', image: 'assets/artifacts/video/maze-key.jpg', imageAlt: '미로의 열쇠 아티팩트 이미지',
      stats: [{name:'공격력',value:'N'},{name:'타격력',value:'N'},{name:'HP',value:'N%'}],
      effects: [{html:'착용자의 공격력 <strong>4%</strong> 증가',search:'착용자의 공격력 4% 증가'}], skill: genericSkill()
    },
    {
      id: 'boundary-rope', name: '경계의 밧줄', grade: 'R', role: 'anchor', image: 'assets/artifacts/video/boundary-rope.jpg', imageAlt: '경계의 밧줄 아티팩트 이미지',
      stats: [{name:'공격력',value:'N'},{name:'타격력',value:'N'},{name:'US포인트 회복',value:'N%'}],
      effects: [{html:'착용자의 공격력 <strong>4%</strong> 증가',search:'착용자의 공격력 4% 증가'}], skill: genericSkill()
    },
    {
      id: 'wisdom-vial', name: '지혜의 약병', grade: 'R', role: 'defender', image: 'assets/artifacts/video/wisdom-vial.jpg', imageAlt: '지혜의 약병 아티팩트 이미지',
      stats: [{name:'공격력',value:'N'},{name:'타격력',value:'N'},{name:'방어력',value:'N%'}],
      effects: [{html:'착용자의 최대 HP <strong>4%</strong> 증가',search:'착용자의 최대 HP 4% 증가'}], skill: genericSkill()
    }
  ];

  const esc = (value) => String(value ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;');

  const list = document.getElementById('artifact-list');
  const search = document.getElementById('artifact-search');
  const count = document.getElementById('artifact-count');
  const empty = document.getElementById('artifact-empty');
  const reset = document.getElementById('artifact-reset-filters');
  const filterButtons = [...document.querySelectorAll('.artifact-filter-toolbar .filter-icon-button[data-filter-group]')];
  const selected = { grade: new Set(), role: new Set() };

  function searchText(item) {
    const role = ROLE_INFO[item.role]?.name || item.role;
    return [item.name,item.grade,role,...item.stats.flatMap((stat)=>[stat.name,stat.value]),...item.effects.map((effect)=>effect.search),item.skill.name,item.skill.owner,item.skill.bonus].join(' ').toLocaleLowerCase('ko-KR');
  }

  function matchesFilters(item) {
    const query = (search?.value || '').trim().toLocaleLowerCase('ko-KR');
    if (query && !searchText(item).includes(query)) return false;
    if (selected.grade.size && !selected.grade.has(item.grade)) return false;
    if (selected.role.size && !selected.role.has(item.role)) return false;
    return true;
  }

  function renderSkill(item) {
    const skill = item.skill;
    const label = skill.href
      ? `<a class="artifact-skill-deep-link" data-owner="${esc(skill.owner)}의 스킬" href="${esc(skill.href)}">${esc(skill.name)}</a>`
      : `<span class="artifact-skill-plain">${esc(skill.name)}</span>`;
    return `<div class="artifact-sheet-skill-row">
      <span class="artifact-sheet-owner-portrait ${skill.href ? '' : 'is-generic'}"><img src="${esc(skill.ownerPortrait)}" alt="${esc(skill.owner || '얼티메이트 스킬')}"/></span>
      <div class="artifact-sheet-skill-copy">${label}<strong>${esc(skill.bonus)}</strong></div>
    </div>`;
  }

  function renderCard(item) {
    const role = ROLE_INFO[item.role] || { name: item.role, icon: '' };
    const stats = item.stats.map((stat)=>`<div class="artifact-sheet-stat-row"><span>${esc(stat.name)}</span><strong>${esc(stat.value)}</strong></div>`).join('');
    const effects = item.effects.map((effect)=>`<p>${effect.html}</p>`).join('');
    return `<details class="artifact-entry artifact-sheet" data-artifact-id="${esc(item.id)}" data-grade="${esc(item.grade)}" data-role="${esc(item.role)}">
      <summary class="artifact-sheet-titlebar">
        <span class="artifact-sheet-title-row"><h2>${esc(item.name)}</h2><span aria-hidden="true" class="summary-action"><i></i></span></span>
        <span class="artifact-sheet-art artifact-sheet-summary-art"><img src="${esc(item.image)}" alt="${esc(item.imageAlt)}" loading="lazy" decoding="async"/></span>
      </summary>
      <div class="artifact-sheet-body">
        <section class="artifact-sheet-stats" aria-label="스탯">${stats}</section>
        <section class="artifact-sheet-effect-section" aria-label="장착 역할군 및 효과">
          <div class="artifact-sheet-role-line"><span class="identity-icon-bg artifact-sheet-role-bg"><img alt="${esc(role.name)}" class="character-identity-icon role-icon" src="${esc(role.icon)}"/></span><strong>${esc(role.name)} 장착 시 적용</strong></div>
          <div class="artifact-sheet-effects">${effects}</div>
        </section>
        <section class="artifact-sheet-skill-section" aria-label="강화 스킬">${renderSkill(item)}</section>
      </div>
    </details>`;
  }

  function applyFilters() {
    const gradeOrder = { SSR: 0, SR: 1, R: 2 };
    const matches = ARTIFACTS.filter(matchesFilters)
      .map((item, index) => ({ item, index }))
      .sort((a, b) => {
        const gradeDiff = (gradeOrder[a.item.grade] ?? 99) - (gradeOrder[b.item.grade] ?? 99);
        if (gradeDiff) return gradeDiff;
        if (a.item.grade === 'SSR') {
          const aPickup = a.item.id === 'repin-de-justis' ? 0 : 1;
          const bPickup = b.item.id === 'repin-de-justis' ? 0 : 1;
          if (aPickup !== bPickup) return aPickup - bPickup;
        }
        return a.index - b.index;
      })
      .map(({ item }) => item);
    list.innerHTML = matches.map(renderCard).join('');
    count.textContent = String(matches.length);
    empty.hidden = matches.length !== 0;
    if (reset) {
      const showReset = !!((search?.value || '').trim() || selected.grade.size || selected.role.size);
      reset.classList.toggle('is-placeholder', !showReset);
      reset.disabled = !showReset;
      reset.setAttribute('aria-hidden', showReset ? 'false' : 'true');
    }
  }

  filterButtons.forEach((button)=>button.addEventListener('click',()=>{
    const group=button.dataset.filterGroup,value=button.dataset.filterValue,set=selected[group];
    if(!set)return;
    if(set.has(value))set.delete(value);else set.add(value);
    const active=set.has(value);button.classList.toggle('active',active);button.setAttribute('aria-pressed',active?'true':'false');applyFilters();
  }));
  search?.addEventListener('input',applyFilters);
  reset?.addEventListener('click',()=>{if(search)search.value='';selected.grade.clear();selected.role.clear();filterButtons.forEach((b)=>{b.classList.remove('active');b.setAttribute('aria-pressed','false')});applyFilters();});
  document.getElementById('artifact-expand-all')?.addEventListener('click',()=>list.querySelectorAll('details.artifact-entry').forEach((d)=>d.open=true));
  document.getElementById('artifact-collapse-all')?.addEventListener('click',()=>list.querySelectorAll('details.artifact-entry').forEach((d)=>d.open=false));

  // 캐릭터/용어 사전과 동일한 플로팅 용어 설명.
  const tooltip = document.querySelector('.tooltip');
  let activeTooltip = null;
  const definition = (term) => term?.sections?.find((section) => section.label === '정의 및 효과 설명')?.text || term?.sections?.[0]?.text || '';
  function placeTooltip(target) {
    if (!tooltip || !target) return;
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
    tooltip.innerHTML = `<div class="tooltip-category">${esc(term.category)}</div><h3>${esc(term.name)}</h3><p>${esc(definition(term)).replaceAll('\n','<br>')}</p>`;
    tooltip.classList.add('visible');
    tooltip.setAttribute('aria-hidden','false');
    requestAnimationFrame(() => placeTooltip(target));
  }
  function hideTooltip() {
    activeTooltip = null;
    tooltip?.classList.remove('visible');
    tooltip?.setAttribute('aria-hidden','true');
  }
  document.addEventListener('mouseover', (event) => {
    const target = event.target.closest('.term-link[data-term]');
    if (target) showTooltip(target);
  });
  document.addEventListener('mouseout', (event) => {
    const target = event.target.closest('.term-link[data-term]');
    if (!target) return;
    if (event.relatedTarget && target.contains(event.relatedTarget)) return;
    hideTooltip();
  });
  document.addEventListener('click', (event) => {
    const target = event.target.closest('.term-link[data-term]');
    if (target) {
      event.preventDefault();
      activeTooltip === target ? hideTooltip() : showTooltip(target);
    } else if (!event.target.closest('.tooltip')) hideTooltip();
  });
  window.addEventListener('scroll', () => { if (activeTooltip) placeTooltip(activeTooltip); }, { passive:true });
  window.addEventListener('resize', () => { if (activeTooltip) placeTooltip(activeTooltip); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') hideTooltip(); });

  applyFilters();
})();
