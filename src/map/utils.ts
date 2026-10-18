export const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export function smooth(t: number) {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
}
export const shortName = (name: string) =>
  name
    .replace("恩施土家族苗族自治州", "恩施州")
    .replace("湘西土家族苗族自治州", "湘西州");
export const placeKey = (regionId: string, adcode: number) =>
  `${regionId}:${adcode}`;

// Search equivalences for common administrative/place-name characters; display text is untouched.
const PLACE_SEARCH_CHARACTERS: Readonly<Record<string, string>> = {
  臺: "台",
  灣: "湾",
  蓮: "莲",
  縣: "县",
  義: "义",
  門: "门",
  東: "东",
  連: "连",
  區: "区",
  鄉: "乡",
  鎮: "镇",
  萬: "万",
  華: "华",
  龍: "龙",
  鳳: "凤",
  豐: "丰",
  壽: "寿",
  龜: "龟",
  烏: "乌",
  樹: "树",
  橋: "桥",
  關: "关",
  蘆: "芦",
  頭: "头",
  觀: "观",
  復: "复",
  興: "兴",
  內: "内",
  園: "园",
  員: "员",
  莊: "庄",
  學: "学",
  營: "营",
  崙: "仑",
  崗: "岗",
  岡: "冈",
  嶺: "岭",
  綠: "绿",
  鹽: "盐",
  線: "线",
  濱: "滨",
  貢: "贡",
  雙: "双",
  鶯: "莺",
  層: "层",
  蘭: "兰",
  羅: "罗",
  麥: "麦",
  楊: "杨",
  歸: "归",
  榮: "荣",
  滿: "满",
  長: "长",
  樂: "乐",
  陸: "陆",
  霧: "雾",
  廬: "庐",
  獅: "狮",
  魚: "鱼",
  貓: "猫",
  碼: "码",
  馬: "马",
  達: "达",
  寧: "宁",
  賢: "贤",
  聖: "圣",
  鄒: "邹",
  嶼: "屿",
  彌: "弥",
  彎: "弯",
  溝: "沟",
  遠: "远",
  鋒: "锋",
  橫: "横",
  鄰: "邻",
  後: "后",
  蘇: "苏",
};

export function normalizePlaceQuery(value: string): string {
  return Array.from(
    value.normalize("NFKC").trim().toLowerCase(),
    (character) => PLACE_SEARCH_CHARACTERS[character] || character,
  ).join("");
}

/** A province's own camera footprint controls when its extra detail is useful. */
export function regionTransition(region: {
  extent: number[];
  focusExtent?: number[];
  transitionZoom?: [number, number];
}): [number, number] {
  if (region.transitionZoom) return [...region.transitionZoom];
  const extent = region.focusExtent || region.extent;
  const span = Math.max(extent[2] - extent[0], extent[3] - extent[1], 1);
  const shift = Math.max(-1.5, Math.min(5.6, Math.log2(880000 / span)));
  return [5.6 + shift, 7 + shift];
}
