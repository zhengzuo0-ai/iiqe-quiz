// Character encouragement system for IIQE Quiz App
// 5 characters: Luka, Rocky, Winter, Spring, Ohtani (Easter egg)

const CHARACTERS = {
  luka: {
    name: 'Luka',
    emoji: '👦',
    description: '大儿子',
    poses: {
      cheer: '/characters/luka_cheer.png',
      encourage: '/characters/luka_encourage.png',
      surprise: '/characters/luka_surprise.png',
      celebrate: '/characters/luka_celebrate.png',
    },
    lines: {
      cheer: [
        '妈妈太厉害了吧！🌟',
        '妈妈好聪明！我也要像你一样！',
        '哇！妈妈答对了！',
        '妈妈最棒了！💪',
        '太厉害了妈妈！再来一题！',
        '妈妈好强！我给你鼓掌！👏',
      ],
      encourage: [
        '没关系妈妈！下一题一定行的！',
        '妈妈加油！我相信你！❤️',
        '这题好难…但妈妈一定能学会！',
        '没事没事！我们再试一次！',
        '妈妈不要灰心，你已经很棒了！',
        '错了也没关系，记住就好啦！',
      ],
      surprise: [
        '妈妈你是天才吗！！😲',
        '不可能！连对这么多题！妈妈太强了！',
        '哇哦！！妈妈开挂了吗！🔥',
        '妈妈这也太厉害了吧！停不下来！',
      ],
      celebrate: [
        '妈妈考过了！！！我好骄傲！🎉🎉🎉',
        '太棒了妈妈！你是最厉害的！🏆',
        '妈妈好厉害！我要告诉所有人！',
        '恭喜妈妈！我就知道你可以的！🎊',
      ],
    },
  },
  rocky: {
    name: 'Rocky',
    emoji: '👶',
    description: '二儿子',
    poses: {
      cheer: '/characters/rocky_cheer.png',
      encourage: '/characters/rocky_encourage.png',
      surprise: '/characters/rocky_surprise.png',
      celebrate: '/characters/rocky_celebrate.png',
    },
    lines: {
      cheer: [
        '妈妈～棒棒！❤️',
        '妈妈好棒！啵～😘',
        '耶！妈妈厉害！',
        '妈妈～嘻嘻～👏',
        '妈妈～对了对了！',
      ],
      encourage: [
        '妈妈抱抱～❤️',
        '妈妈不哭～下次一定行！',
        '妈妈加油～Rocky爱你！',
        '没关系～妈妈最棒了！',
        '妈妈～我给你加油！💪',
      ],
      surprise: [
        '哇！！妈妈！！😯❤️',
        '妈妈好厉害！Rocky看呆了！',
        '噢噢噢！妈妈！！✨',
      ],
      celebrate: [
        '妈妈！妈妈！耶耶耶！🎉❤️',
        '啊啊啊！妈妈通过了！😍',
        '妈妈最棒！Rocky最爱妈妈！❤️🎊',
      ],
    },
  },
  winter: {
    name: 'Winter',
    emoji: '🐕‍🦺',
    description: '白色金毛',
    poses: {
      cheer: '/characters/winter_cheer.png',
      encourage: '/characters/winter_encourage.png',
      surprise: '/characters/winter_surprise.png',
      celebrate: '/characters/winter_celebrate.png',
    },
    lines: {
      cheer: [
        '汪汪！妈妈好棒！🐾',
        '汪！答对了！摇尾巴～',
        '妈妈厉害！Winter给你叼拖鞋！🐾',
        '汪汪汪！太开心了！',
        '好棒好棒！Winter要舔舔你！',
      ],
      encourage: [
        '汪…妈妈别伤心，Winter陪你～🐾',
        '没关系汪！下次一定行！',
        'Winter蹭蹭你～别灰心！',
        '汪～妈妈已经很棒了！',
        '妈妈摸摸Winter，休息一下再来！',
      ],
      surprise: [
        '汪汪汪汪汪！！！妈妈太强了！🐾🔥',
        '嗷呜！！Winter都惊呆了！',
        '疯狂摇尾巴！妈妈太厉害！',
      ],
      celebrate: [
        '汪汪汪！！妈妈通过了！！转圈圈！🎉🐾',
        'Winter要跳上沙发庆祝了！汪！🎊',
        '呜呜呜～妈妈好棒！Winter流泪了！🐾❤️',
      ],
    },
  },
  spring: {
    name: 'Spring',
    emoji: '🐕',
    description: '金色金毛',
    poses: {
      cheer: '/characters/spring_cheer.png',
      encourage: '/characters/spring_encourage.png',
      surprise: '/characters/spring_surprise.png',
      celebrate: '/characters/spring_celebrate.png',
    },
    lines: {
      cheer: [
        '汪！妈妈真聪明！Spring好开心！🌸',
        '摇尾巴摇尾巴！妈妈答对了！',
        '妈妈好厉害！Spring要给你叼球！🎾',
        '汪汪！Spring也学到了！',
        '好棒！Spring给你打滚庆祝！',
      ],
      encourage: [
        '汪～Spring靠过来取暖，别怕！🌸',
        '妈妈别担心！Spring陪你一起学！',
        '没事汪！Spring给你叼零食来了！🍪',
        '妈妈加油！Spring把头放你腿上～',
        '汪！错了也没关系，妈妈最棒了！',
      ],
      surprise: [
        '汪汪汪！！！Spring跳起来了！🌸🔥',
        '啊啊啊汪！妈妈你是不是开挂了！',
        'Spring惊呆了！疯狂甩耳朵！',
      ],
      celebrate: [
        '汪汪汪！！妈妈通过了！Spring要咬飞盘庆祝！🎉🌸',
        '全家去公园庆祝！汪汪！🎊🐾',
        'Spring太开心了！满地打滚！妈妈最棒！❤️',
      ],
    },
  },
  ohtani: {
    name: '大谷翔平',
    emoji: '⚾',
    description: '彩蛋角色',
    isEasterEgg: true,
    poses: {
      cheer: null, // TODO: waiting for Z to resend ohtani images (got overwritten by winter)
      encourage: null,
      surprise: null,
      celebrate: null,
    },
    useEmoji: true, // fallback to ⚾ emoji until real image is provided
    lines: {
      cheer: [
        'すごい！完璧だ！⚾\n（太厉害了！完美！）',
        'ナイス！その調子！💪\n（Nice！就是这个状态！）',
        'お見事です！⚾✨\n（太漂亮了！）',
        'よくできました！👏\n（做得好！）',
      ],
      encourage: [
        '大丈夫！次は絶対できる！⚾\n（没关系！下次一定行！）',
        '諦めないで！君ならできる！💪\n（不要放弃！你可以的！）',
        '失敗は成功の母！頑張って！\n（失败乃成功之母！加油！）',
        'まだまだこれから！⚾\n（一切才刚开始！）',
      ],
      surprise: [
        '信じられない！天才だ！⚾🔥\n（难以置信！你是天才！）',
        'ホームラン級だ！！💥\n（全垒打级别！！）',
        'MVP！MVP！MVP！⚾✨\n（最有价值选手！）',
      ],
      celebrate: [
        'おめでとう！最高だ！🏆⚾\n（恭喜！最棒了！）',
        '優勝だ！シャンパンファイト！🍾⚾\n（冠军了！开香槟！）',
        'やったね！世界一だ！🌍⚾✨\n（做到了！世界第一！）',
      ],
    },
  },
};

// Get a random character for a given scene
// Ohtani appears ~15% of the time as easter egg
export function getRandomCharacter(scene) {
  const roll = Math.random();
  
  if (roll < 0.15) {
    // Easter egg: Ohtani!
    const char = CHARACTERS.ohtani;
    const lines = char.lines[scene];
    return {
      ...char,
      pose: char.poses[scene],
      line: lines[Math.floor(Math.random() * lines.length)],
    };
  }
  
  // Regular characters
  const regularKeys = ['luka', 'rocky', 'winter', 'spring'];
  const key = regularKeys[Math.floor(Math.random() * regularKeys.length)];
  const char = CHARACTERS[key];
  const lines = char.lines[scene];
  
  return {
    ...char,
    pose: char.poses[scene],
    line: lines[Math.floor(Math.random() * lines.length)],
  };
}

// Get all characters for group celebration
export function getAllCharacters(scene) {
  return Object.values(CHARACTERS).map(char => ({
    ...char,
    pose: char.poses[scene],
    line: char.lines[scene][Math.floor(Math.random() * char.lines[scene].length)],
  }));
}

export default CHARACTERS;
