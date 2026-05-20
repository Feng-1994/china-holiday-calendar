const SHICHEN_DATA: { name: string; alias: string; startHour: number; endHour: number }[] = [
  { name: '子时', alias: '夜半', startHour: 23, endHour: 1 },
  { name: '丑时', alias: '鸡鸣', startHour: 1, endHour: 3 },
  { name: '寅时', alias: '平旦', startHour: 3, endHour: 5 },
  { name: '卯时', alias: '日出', startHour: 5, endHour: 7 },
  { name: '辰时', alias: '食时', startHour: 7, endHour: 9 },
  { name: '巳时', alias: '隅中', startHour: 9, endHour: 11 },
  { name: '午时', alias: '日中', startHour: 11, endHour: 13 },
  { name: '未时', alias: '日昳', startHour: 13, endHour: 15 },
  { name: '申时', alias: '哺时', startHour: 15, endHour: 17 },
  { name: '酉时', alias: '日入', startHour: 17, endHour: 19 },
  { name: '戌时', alias: '黄昏', startHour: 19, endHour: 21 },
  { name: '亥时', alias: '人定', startHour: 21, endHour: 23 },
];

export function getCurrentShichen(): { name: string; alias: string; period: string } {
  const hour = new Date().getHours();
  let idx: number;
  if (hour >= 23 || hour < 1) idx = 0;
  else if (hour >= 1 && hour < 3) idx = 1;
  else if (hour >= 3 && hour < 5) idx = 2;
  else if (hour >= 5 && hour < 7) idx = 3;
  else if (hour >= 7 && hour < 9) idx = 4;
  else if (hour >= 9 && hour < 11) idx = 5;
  else if (hour >= 11 && hour < 13) idx = 6;
  else if (hour >= 13 && hour < 15) idx = 7;
  else if (hour >= 15 && hour < 17) idx = 8;
  else if (hour >= 17 && hour < 19) idx = 9;
  else if (hour >= 19 && hour < 21) idx = 10;
  else idx = 11;

  const sc = SHICHEN_DATA[idx];
  const startStr = sc.startHour.toString().padStart(2, '0') + ':00';
  const endStr = sc.endHour.toString().padStart(2, '0') + ':00';
  return {
    name: sc.name,
    alias: sc.alias,
    period: `${startStr}-${endStr}`,
  };
}

const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const WUXING_GAN: { [key: string]: string } = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
  己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
};

const WUXING_ZHI: { [key: string]: string } = {
  子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火',
  午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水',
};

const CHONG_MAP: { [key: string]: string } = {
  子: '午', 丑: '未', 寅: '申', 卯: '酉', 辰: '戌', 巳: '亥',
  午: '子', 未: '丑', 申: '寅', 酉: '卯', 戌: '辰', 亥: '巳',
};

const SHA_MAP: { [key: string]: string } = {
  子: '南', 丑: '东', 寅: '北', 卯: '西', 辰: '南', 巳: '东',
  午: '北', 未: '西', 申: '南', 酉: '东', 戌: '北', 亥: '西',
};

const PENGZU_GAN: { [key: string]: string } = {
  甲: '甲不开仓财物耗散',
  乙: '乙不栽植千株不长',
  丙: '丙不修灶必见灾殃',
  丁: '丁不剃头头必生疮',
  戊: '戊不受田田主不祥',
  己: '己不破券二比并亡',
  庚: '庚不经络织机虚张',
  辛: '辛不合酱主人不尝',
  壬: '壬不汲水更难提防',
  癸: '癸不词讼理弱敌强',
};

const PENGZU_ZHI: { [key: string]: string } = {
  子: '子不问卜自惹祸殃',
  丑: '丑不冠带主不还乡',
  寅: '寅不祭祀神鬼不尝',
  卯: '卯不穿井水泉不香',
  辰: '辰不哭泣必主重丧',
  巳: '巳不远行财物伏藏',
  午: '午不苫盖屋主更张',
  未: '未不服药毒气入肠',
  申: '申不安床鬼祟入房',
  酉: '酉不宴客醉坐颠狂',
  戌: '戌不吃犬作怪上床',
  亥: '亥不嫁娶不利新郎',
};

function getYearGanZhi(year: number): { gan: string; zhi: string } {
  const ganIdx = (year - 4) % 10;
  const zhiIdx = (year - 4) % 12;
  return { gan: TIANGAN[ganIdx], zhi: DIZHI[zhiIdx] };
}

function getMonthGanZhi(year: number, month: number): { gan: string; zhi: string } {
  const yearGanIdx = (year - 4) % 10;
  const monthGanBase = yearGanIdx % 5 === 0 ? 2 : yearGanIdx % 5 === 1 ? 4 : yearGanIdx % 5 === 2 ? 6 : yearGanIdx % 5 === 3 ? 8 : 0;
  const ganIdx = (monthGanBase + month - 1) % 10;
  const zhiIdx = (month + 1) % 12;
  return { gan: TIANGAN[ganIdx], zhi: DIZHI[zhiIdx] };
}

function getDayGanZhi(year: number, month: number, day: number): { gan: string; zhi: string } {
  const date = new Date(year, month - 1, day);
  const baseDate = new Date(2024, 0, 1);
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const baseGanIdx = 0;
  const baseZhiIdx = 0;
  const ganIdx = ((baseGanIdx + diffDays) % 10 + 10) % 10;
  const zhiIdx = ((baseZhiIdx + diffDays) % 12 + 12) % 12;
  return { gan: TIANGAN[ganIdx], zhi: DIZHI[zhiIdx] };
}

const YI_ACTIVITIES: { [key: string]: string[] } = {
  甲: ['开市', '交易', '立券', '纳财'],
  乙: ['栽种', '纳采', '求嗣', '祭祀'],
  丙: ['修造', '动土', '安机械', '造仓'],
  丁: ['祭祀', '祈福', '求嗣', '斋醮'],
  戊: ['修造', '动土', '安床', '入宅'],
  己: ['开仓', '纳财', '栽种', '牧养'],
  庚: ['开光', '祈福', '求嗣', '出行'],
  辛: ['祭祀', '祈福', '求嗣', '开光'],
  壬: ['出行', '移徙', '纳采', '入宅'],
  癸: ['嫁娶', '纳采', '祭祀', '祈福'],
};

const JI_ACTIVITIES: { [key: string]: string[] } = {
  甲: ['嫁娶', '入宅', '移徙', '安葬'],
  乙: ['开市', '动土', '破土', '安葬'],
  丙: ['嫁娶', '入宅', '安葬', '开仓'],
  丁: ['动土', '破土', '修造', '开市'],
  戊: ['嫁娶', '栽种', '开市', '纳畜'],
  己: ['动土', '破土', '安葬', '行丧'],
  庚: ['动土', '破土', '嫁娶', '安葬'],
  辛: ['动土', '破土', '修造', '安葬'],
  壬: ['动土', '破土', '安葬', '开仓'],
  癸: ['动土', '破土', '开市', '入宅'],
};

const ZHI_YI: { [key: string]: string[] } = {
  子: ['祈福', '纳采', '嫁娶', '求嗣'],
  丑: ['祭祀', '祈福', '求嗣', '开光'],
  寅: ['纳采', '嫁娶', '开市', '交易'],
  卯: ['开市', '交易', '纳财', '栽种'],
  辰: ['祭祀', '祈福', '求嗣', '斋醮'],
  巳: ['修造', '动土', '安机械', '造仓'],
  午: ['开光', '祈福', '求嗣', '出行'],
  未: ['祭祀', '祈福', '修造', '动土'],
  申: ['嫁娶', '纳采', '开市', '出行'],
  酉: ['祭祀', '祈福', '求嗣', '开光'],
  戌: ['纳采', '嫁娶', '开市', '交易'],
  亥: ['祭祀', '祈福', '修造', '动土'],
};

const ZHI_JI: { [key: string]: string[] } = {
  子: ['动土', '破土', '安葬', '行丧'],
  丑: ['动土', '破土', '嫁娶', '开仓'],
  寅: ['修造', '动土', '安葬', '行丧'],
  卯: ['嫁娶', '入宅', '移徙', '安葬'],
  辰: ['动土', '破土', '开仓', '纳畜'],
  巳: ['嫁娶', '入宅', '安葬', '开仓'],
  午: ['动土', '破土', '安葬', '行丧'],
  未: ['嫁娶', '入宅', '移徙', '安葬'],
  申: ['动土', '破土', '安葬', '行丧'],
  酉: ['动土', '破土', '嫁娶', '开仓'],
  戌: ['动土', '破土', '修造', '安葬'],
  亥: ['嫁娶', '入宅', '移徙', '安葬'],
};

export interface AlmanacInfo {
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;
  dayWuXing: string;
  chong: string;
  sha: string;
  pengZu: string;
  yi: string[];
  ji: string[];
}

export function getAlmanac(year: number, month: number, day: number): AlmanacInfo {
  const yearGZ = getYearGanZhi(year);
  const monthGZ = getMonthGanZhi(year, month);
  const dayGZ = getDayGanZhi(year, month, day);

  const ganYi = YI_ACTIVITIES[dayGZ.gan] || [];
  const zhiYi = ZHI_YI[dayGZ.zhi] || [];
  const allYi = [...new Set([...ganYi, ...zhiYi])].slice(0, 6);

  const ganJi = JI_ACTIVITIES[dayGZ.gan] || [];
  const zhiJi = ZHI_JI[dayGZ.zhi] || [];
  const allJi = [...new Set([...ganJi, ...zhiJi])].slice(0, 6);

  const chongZhi = CHONG_MAP[dayGZ.zhi];
  const chongGan = TIANGAN[(TIANGAN.indexOf(dayGZ.gan) + 6) % 10];

  return {
    yearGanZhi: `${yearGZ.gan}${yearGZ.zhi}年`,
    monthGanZhi: `${monthGZ.gan}${monthGZ.zhi}月`,
    dayGanZhi: `${dayGZ.gan}${dayGZ.zhi}日`,
    dayWuXing: `${WUXING_GAN[dayGZ.gan]}${WUXING_ZHI[dayGZ.zhi]}`,
    chong: `冲${chongGan}${chongZhi}(${WUXING_ZHI[chongZhi]})`,
    sha: `煞${SHA_MAP[dayGZ.zhi]}`,
    pengZu: `${PENGZU_GAN[dayGZ.gan]} ${PENGZU_ZHI[dayGZ.zhi]}`,
    yi: allYi,
    ji: allJi,
  };
}
