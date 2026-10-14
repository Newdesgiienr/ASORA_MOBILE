window.AO_TERMS = {
  terms: [
    {
      id: 'round', number: 1, category: '전투 기본 규칙', name: '#라운드', color: 'cyan',
      sections: [
        { label: '정의 및 효과 설명', text: '전투 진행 및 효과의 지속시간을 계산하는 기본 단위입니다.\nAction Phase와 Engage Phase를 하나의 묶음으로 계산하며, 두 페이즈가 모두 진행되면 1라운드가 경과합니다.\n즉, Action Phase + Engage Phase = 1R입니다.' }
      ]
    },
    {
      id: 'ap', number: 2, category: '전투 기본 규칙', name: 'AP', color: 'orange',
      sections: [
        { label: '정의 및 효과 설명', text: '전투 중 스킬 사용 및 캐릭터 행동에 소비하는 행동 자원입니다. 남은 AP를 사용해 추가 행동을 이어갈 수 있습니다.' },
        { label: '표기 규칙', text: 'AP +N은 현재 사용할 수 있는 AP가 N만큼 증가하는 효과로 기록합니다. 기본 AP +N은 라운드에서 확보하는 기준 AP 자체가 증가하는 효과로 구분해 기록합니다.' }
      ]
    },
    {
      id: 'us', number: 3, category: '전투 기본 규칙', name: 'US 포인트', color: 'orange',
      sections: [
        { label: '정의 및 효과 설명', text: '얼티메이트 스킬 사용에 필요한 전용 자원입니다. 얼티메이트 스킬마다 요구 US 포인트가 존재합니다.' },
        { label: '관련 항목', text: '캐릭터에 따라 초기 US 포인트, 현재 US 포인트, 최대 US 포인트, 요구 US 포인트를 구분해 기록합니다.' }
      ]
    },
    {
      id: 'ct', number: 4, category: '전투 기본 규칙', name: 'CT', color: 'orange',
      sections: [
        { label: '정의 및 효과 설명', text: '스킬의 재사용 대기 시간을 의미합니다. 본 사이트에서는 쿨타임을 CT로 통일해 표기하며 스킬 정보에는 CT 1, CT 5처럼 숫자만 함께 표시합니다.' }
      ]
    },
    {
      id: 'notice', number: 5, category: '모아 전용 자원', name: '#괴도의 예고장', color: 'cyan',
      sections: [
        { label: '정의 및 효과 설명', text: '모아 전용 자원입니다. 기본 유지 라운드는 6이며, 얼티메이트 스킬과 고유 능력 등 여러 효과의 조건으로 사용됩니다.' }
      ]
    },
    {
      id: 'plunder', number: 6, category: '상태 효과', name: '#강탈', color: 'purple',
      sections: [
        { label: '정의 및 효과 설명', text: '부여된 대상의 능력치를 감소시키고, 시전자의 능력치를 증가시키는 효과입니다.' }
      ]
    },
    {
      id: 'fracture', number: 7, category: '상태 효과', name: '#파쇄', color: 'red',
      sections: [
        { label: '정의 및 효과 설명', text: '부여된 대상의 방어력을 1% 감소시킵니다. 최대 5중첩, 유지 라운드 5입니다.\n대상에게 부여된 #파쇄를 소모할 때마다 모아의 관련 스킬에서 500% 추가 피해가 발생합니다.' }
      ]
    },
    {
      id: 'assault-block', number: 8, category: '전투 판정', name: '#강습 차단', color: 'green',
      sections: [
        { label: '정의 및 효과 설명', text: '#강습을 차단하고 판정에서 승리하는 효과입니다.' }
      ]
    },
    {
      id: 'assault', number: 9, category: '전투 판정', name: '#강습', color: 'purple',
      sections: [
        { label: '정의 및 효과 설명', text: '적의 보라색 패턴에 대응하는 특수 행동입니다. 일반적인 방법으로 막을 수 없는 특수 행동을 의미합니다.' }
      ]
    },
    {
      id: 'magic-release', number: 10, category: '이로운 효과', name: '#마력 개방', color: 'green',
      sections: [
        { label: '정의 및 효과 설명', text: '2중첩마다 기본 AP +1 효과를 얻습니다. 최대 4중첩까지 적용됩니다.' }
      ]
    },
    {
      id: 'curse', number: 11, category: '해로운 효과', name: '#저주', color: 'purple',
      sections: [
        { label: '정의 및 효과 설명', text: '부여된 대상의 공격력과 타격력을 각각 0.1% 감소시킵니다. 최대 99중첩까지 적용됩니다.' }
      ]
    },
    {
      id: 'guard', number: 12, category: '상태 효과', name: '#가드', color: 'blue',
      sections: [
        { label: '정의 및 효과 설명', text: '부여된 대상의 받는 피해 감소율을 50% 증가시키는 효과입니다.' }
      ]
    },
    {
      id: 'shield', number: 13, category: '이로운 효과', name: '#보호막', color: 'green',
      sections: [
        { label: '정의 및 효과 설명', text: '부여된 대상이 받는 HP 피해와 BP 피해를 대신 흡수하는 효과입니다.' }
      ]
    },
    {
      id: 'ruby', number: 14, category: '마요이 전용 자원', name: '#루비', color: 'red',
      sections: [
        { label: '정의 및 효과 설명', text: '마요이의 보석 효과입니다. 공격력이 20% 증가하며 유지 라운드는 1입니다.' }
      ]
    },
    {
      id: 'topaz', number: 15, category: '마요이 전용 자원', name: '#토파즈', color: 'orange',
      sections: [
        { label: '정의 및 효과 설명', text: '마요이의 보석 효과입니다. 치명타 확률이 10% 증가하며 유지 라운드는 1입니다.' }
      ]
    },
    {
      id: 'emerald', number: 16, category: '마요이 전용 자원', name: '#에메랄드', color: 'green',
      sections: [
        { label: '정의 및 효과 설명', text: '마요이의 보석 효과입니다. 타격력이 20% 증가하며 유지 라운드는 1입니다.' }
      ]
    },
    {
      id: 'diamond', number: 17, category: '마요이 전용 자원', name: '#다이아몬드', color: 'blue',
      sections: [
        { label: '정의 및 효과 설명', text: '마요이의 보석 효과입니다. 루비, 에메랄드, 토파즈의 효과를 모두 적용하며 유지 라운드는 1입니다.' }
      ]
    },
    {
      id: 'chain', number: 18, category: '해로운 효과', name: '#연쇄', color: 'purple',
      sections: [
        { label: '정의 및 효과 설명', text: '부여된 대상의 연쇄가 4중첩에 도달하면 해당 대상에게 750% 추가 피해를 입힙니다. 추가 피해 이후 최대 4중첩의 연쇄를 모두 소모합니다. 유지 라운드는 3입니다.' }
      ]
    },
    {
      id: 'cherry-mark', number: 19, category: '카논 전용 자원', name: '#벚꽃 표식', color: 'red',
      sections: [
        { label: '정의 및 효과 설명', text: '카논 전용 자원입니다. 최대 1개까지 부여되며, 부여된 대상의 #저주를 1중첩 감소시킵니다.' }
      ]
    },
    {
      id: 'burn', number: 20, category: '해로운 효과', name: '#화상', color: 'red',
      sections: [
        { label: '정의 및 효과 설명', text: '부여된 대상에게 라운드 종료 시마다 25% 피해를 입히는 지속 피해 효과입니다. 최대 30단계, 유지 라운드 10입니다.' }
      ]
    },
    {
      id: 'time-trace', number: 21, category: '소우카 전용 자원', name: '#시간의 궤적', color: 'blue',
      sections: [
        { label: '정의 및 효과 설명', text: '나츠메 소우카 전용 자원입니다. 최대 10개까지 보유할 수 있으며, 일부 스킬의 AP 획득 효과와 연계됩니다.' }
      ]
    },
    {
      id: 'greek-fire', number: 22, category: '아키나 전용 자원', name: '#그리스의 불', color: 'orange',
      sections: [
        { label: '정의 및 효과 설명', text: '아키나 전용 자원입니다. 기본 최대 보유량은 3개이며, 일부 전투 스킬 사용 시 소모하거나 즉석 충전을 통해 충전합니다.' }
      ]
    },
    {
      id: 'theurgist-light', number: 23, category: '노노 전용 자원', name: '#테우르기스트의 빛', color: 'blue',
      sections: [
        { label: '정의 및 효과 설명', text: '하이바라 노노 전용 자원입니다. 최대 10개까지 보유할 수 있으며, 얼티메이트 스킬 강화와 일부 마력 노드 효과에 사용됩니다.' }
      ]
    }    ,{
      id: 'hit-spear', number: 24, category: '마이 전용 자원', name: '#적중된 창', color: 'orange',
      sections: [
        { label: '정의 및 효과 설명', text: '아사쿠라 마이 전용 자원입니다. 최대 20개까지 부여되며 유지 라운드는 5입니다. 전력 투창과 삼단 투창의 차지 2단계 효과와 연계됩니다.' }
      ]
    },
    {
      id: 'protect-stance', number: 25, category: '전투 판정', name: '#수호', color: 'blue',
      sections: [
        { label: '정의 및 효과 설명', text: '적이 저지 불능 행동을 사용할 때 대응할 수 있는 판정입니다. 스킬 사용 시 이번 라운드 동안 해당 스킬 사용 상태로 유지됩니다.' }
      ]
    }

    ,{
      id: 'plush-doll', number: 25, category: '시온 전용 자원', name: '#봉제인형', color: 'purple',
      sections: [
        { label: '정의 및 효과 설명', text: '노와타리 시온 전용 자원입니다. 최대 4개까지 보유할 수 있습니다.' }
      ]
    },
    {
      id: 'magic-chain', number: 26, category: '리리아 전용 자원', name: '#마력 연쇄', color: 'cyan',
      sections: [
        { label: '정의 및 효과 설명', text: '부여된 대상이 적을 타격할 때마다 시전자의 능력치를 기준으로 100% 추가 피해를 입히고 #마력 연쇄 1중첩을 소모합니다. 최대 50중첩, 유지 라운드 4입니다.' }
      ]
    }
    ,
    {
      id: 'part-break', number: 28, category: '전투 판정', name: '#부위 파괴', color: 'red',
      sections: [
        { label: '정의 및 효과 설명', text: '특정 보스의 부위에 BP 피해가 일정량 누적되면 발동하는 특수 상태입니다. 파괴된 부위에 따라 후속 스킬이나 보스 행동이 달라질 수 있습니다.' }
      ]
    },
    {
      id: 'part-break-left-arm', number: 29, category: '스코어 트라이얼', name: '#부위의 파괴(왼팔)', color: 'red',
      sections: [
        { label: '정의 및 효과 설명', text: '아스타로트에게 BP 피해 누적 시 파괴되며, 아스타로트가 가드 중 피격될 경우 부위 파괴가 더 빨라집니다.' }
      ]
    },
    {
      id: 'part-break-head', number: 30, category: '스코어 트라이얼', name: '#부위의 파괴(머리)', color: 'red',
      sections: [
        { label: '정의 및 효과 설명', text: '아스타로트에게 특정 속성으로 BP 피해가 누적되면 파괴되는 부위입니다.' }
      ]
    },
    {
      id: 'life-drain', number: 31, category: '해로운 효과', name: '#생명 착취', color: 'purple',
      sections: [
        { label: '정의 및 효과 설명', text: '부여된 대상의 공격력, 타격력, 방어력을 감소시키는 효과입니다.' }
      ]
    },
    {
      id: 'focus', number: 32, category: '상태 효과', name: '#집중', color: 'blue',
      sections: [
        { label: '정의 및 효과 설명', text: '강력한 공격을 준비하며, 받는 피해를 감소시키는 상태입니다.' }
      ]
    }

  ]
};
