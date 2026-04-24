import type { StringKey } from './keys';
import type { Locale } from './types';

// Centralized translation table. CLAUDE.md §6's 300-line cap is waived for
// this file — single-source-of-truth beats split-file discoverability here.

const ZH_CN: Record<StringKey, string> = {
  'title.home': '主屏',
  'title.settings': '设置',
  'title.stats': '状态',
  'title.journal': '日记',

  'action.feed': '喂食',
  'action.play': '玩耍',
  'action.rest': '休息',
  'action.clean': '清洁',
  'action.settings': '设置',
  'action.export': '导出数据',
  'action.reset': '重置',

  'permission.health.description':
    '读取步数、睡眠和心率变异度,让你的宠物对你的真实生活做出反应。所有数据仅保存在本设备上。',
  'permission.location.description':
    '用来识别"家"、"公司"等熟悉地点,宠物会有相应反应。位置信息不会离开本设备。',
  'permission.notifications.description': '在宠物饿了、困了或想你的时候提醒你。',
  'permission.calendar.description': '识别日程繁忙程度,让宠物在你忙碌时更安静。',
  'permission.media.description': '保存宠物的合影或动画到你的相册。',

  'setting.sound': '音效',
  'setting.notifications': '通知',
  'setting.language': '语言',
  'setting.birthday': '生日',
  'setting.quietHours': '免打扰时段',
  'setting.dataExport': '导出数据',
  'setting.dataReset': '重置所有数据',

  'notif.feed.title': '{{name}} 饿啦',
  'notif.feed.body': '有点想吃东西,来看看吧。',
  'notif.rest.title': '{{name}} 累啦',
  'notif.rest.body': '能量不足,陪我睡一会儿?',
  'notif.play.title': '{{name}} 想玩',
  'notif.play.body': '一起动一动?',
  'notif.bedtime.title': '夜深了',
  'notif.bedtime.body': '明天见,晚安。',

  'stage.egg': '蛋',
  'stage.baby': '幼儿',
  'stage.child': '孩童',
  'stage.teen': '少年',
  'stage.adult': '成年',

  'mood.happy': '开心',
  'mood.sleepy': '犯困',
  'mood.excited': '兴奋',
  'mood.low': '低落',
  'mood.curious': '好奇',
  'mood.cozy': '惬意',
  'mood.hungry': '饥饿',
  'mood.dirty': '脏兮兮',

  'stat.satiety': '饱食度',
  'stat.energy': '精力',
  'stat.happiness': '心情',

  'common.ok': '好的',
  'common.cancel': '取消',
  'common.save': '保存',
  'common.yes': '是',
  'common.no': '否',
  'common.loading': '加载中…',
  'common.error': '出错了',
};

const EN_US: Record<StringKey, string> = {
  'title.home': 'Home',
  'title.settings': 'Settings',
  'title.stats': 'Stats',
  'title.journal': 'Journal',

  'action.feed': 'Feed',
  'action.play': 'Play',
  'action.rest': 'Rest',
  'action.clean': 'Clean',
  'action.settings': 'Settings',
  'action.export': 'Export data',
  'action.reset': 'Reset',

  'permission.health.description':
    'Read steps, sleep, and HRV so your pet reacts to your real life. All data stays on this device.',
  'permission.location.description':
    'Recognize familiar places like home and work so your pet responds. Location never leaves this device.',
  'permission.notifications.description':
    'Let your pet nudge you when it’s hungry, tired, or missing you.',
  'permission.calendar.description':
    'Sense how busy your schedule is so your pet stays quieter during full days.',
  'permission.media.description': 'Save pet photos and animations to your camera roll.',

  'setting.sound': 'Sound',
  'setting.notifications': 'Notifications',
  'setting.language': 'Language',
  'setting.birthday': 'Birthday',
  'setting.quietHours': 'Quiet hours',
  'setting.dataExport': 'Export data',
  'setting.dataReset': 'Reset all data',

  'notif.feed.title': '{{name}} is hungry',
  'notif.feed.body': 'Time for a bite?',
  'notif.rest.title': '{{name}} is tired',
  'notif.rest.body': 'Low energy — let’s rest.',
  'notif.play.title': '{{name}} wants to play',
  'notif.play.body': 'A quick game together?',
  'notif.bedtime.title': 'It’s getting late',
  'notif.bedtime.body': 'See you tomorrow. Goodnight.',

  'stage.egg': 'Egg',
  'stage.baby': 'Baby',
  'stage.child': 'Child',
  'stage.teen': 'Teen',
  'stage.adult': 'Adult',

  'mood.happy': 'Happy',
  'mood.sleepy': 'Sleepy',
  'mood.excited': 'Excited',
  'mood.low': 'Low',
  'mood.curious': 'Curious',
  'mood.cozy': 'Cozy',
  'mood.hungry': 'Hungry',
  'mood.dirty': 'Dirty',

  'stat.satiety': 'Satiety',
  'stat.energy': 'Energy',
  'stat.happiness': 'Happiness',

  'common.ok': 'OK',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.yes': 'Yes',
  'common.no': 'No',
  'common.loading': 'Loading…',
  'common.error': 'Something went wrong',
};

export const TRANSLATIONS: Readonly<Record<Locale, Readonly<Record<StringKey, string>>>> =
  Object.freeze({
    'zh-CN': Object.freeze(ZH_CN),
    'en-US': Object.freeze(EN_US),
  });
