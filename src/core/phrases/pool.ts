import type { BubbleKey } from '../visual/types';

// Minimum phrases per bubble key. Daily keys need enough variety to avoid
// repeats over a 30-day rolling window with a 3-phrase recently-used cache.
export const MIN_COUNT_DAILY = 8;
export const MIN_COUNT_FESTIVAL = 4;

export const FESTIVAL_KEYS: readonly BubbleKey[] = ['cny', 'birthday', 'fullmoon'];

// Warm, companion-tone, no judgment, no emoji, no imperative scolding.
export const POOL: Readonly<Record<BubbleKey, readonly string[]>> = Object.freeze({
  hungry: Object.freeze([
    '肚子咕咕叫...',
    '有点饿呜呜',
    '想吃一点点...',
    '嘴巴张张',
    '饿饿饿',
    '主人,饭饭呢',
    '嗷呜,想吃的',
    '空空的好难受',
  ]),
  tired: Object.freeze([
    '嗯......',
    '困得睁不开眼',
    '主人我先眯一会',
    '眼皮好沉',
    '打哈欠ing',
    '想睡觉觉',
    '困困',
    '再撑不住了...',
  ]),
  playful: Object.freeze([
    '陪我玩嘛!',
    '来来来跑起来',
    '今天精力好足',
    '动起来动起来',
    '一起蹦跶蹦跶',
    '来点新花样?',
    '冲鸭!',
    '嘿呀嘿呀',
  ]),
  worried: Object.freeze([
    '今天......还好吗?',
    '我在呢',
    '慢慢来,不急',
    '有我陪着你',
    '要不要抱抱?',
    '放轻松点儿',
    '哎呀,给你一个抱抱',
    '深呼吸深呼吸',
  ]),
  happy: Object.freeze([
    '嘿嘿嘿',
    '今天真好',
    '好开心鸭',
    '心情美美的',
    '蹦蹦跳跳',
    '哼着小曲儿',
    '阳光真好',
    '想转个圈',
  ]),
  excited: Object.freeze([
    '耶!!!',
    '好好好!',
    '太激动了',
    '哇哦哇哦',
    '超棒的!',
    '这能量!',
    '太爽了',
    'yeah!',
  ]),
  cozy: Object.freeze([
    '窝着真舒服...',
    '软软的一团',
    '这感觉恰到好处',
    '不想动不想动',
    '静静地发呆',
    '这会儿最惬意',
    '慢慢翻个身',
    '听听雨声',
  ]),
  curious: Object.freeze([
    '咦?',
    '那是什么?',
    '感觉有趣',
    '让我看看让我看看',
    '呜哇,新鲜事儿',
    '歪头研究中',
    '嗯?嗯?',
    '好奇好奇',
  ]),
  low: Object.freeze([
    '......',
    '就这样陪着你',
    '今天有点低落',
    '不太想说话呢',
    '静一会儿',
    '慢慢就好',
    '挨着你就好',
    '嗯...',
  ]),
  cny: Object.freeze(['新年快乐呀!', '恭喜恭喜~', '给主人拜年啦', '新的一年一起加油']),
  birthday: Object.freeze([
    '生日快乐!(撒花)',
    '今天是你的日子!',
    '祝主人岁岁平安',
    '蛋糕在哪儿蛋糕在哪儿',
  ]),
  fullmoon: Object.freeze(['月亮圆圆的...', '今晚的月色真美', '望着月亮发呆', '月光温柔得很']),
});

export function minCountFor(key: BubbleKey): number {
  return FESTIVAL_KEYS.includes(key) ? MIN_COUNT_FESTIVAL : MIN_COUNT_DAILY;
}
