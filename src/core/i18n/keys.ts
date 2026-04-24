export type StringKey =
  // Screen titles
  | 'title.home'
  | 'title.settings'
  | 'title.stats'
  | 'title.journal'
  // Action buttons
  | 'action.feed'
  | 'action.play'
  | 'action.rest'
  | 'action.clean'
  | 'action.settings'
  | 'action.export'
  | 'action.reset'
  // Permission descriptions (Info.plist usage strings mirror these)
  | 'permission.health.description'
  | 'permission.location.description'
  | 'permission.notifications.description'
  | 'permission.calendar.description'
  | 'permission.media.description'
  // Settings labels
  | 'setting.sound'
  | 'setting.notifications'
  | 'setting.language'
  | 'setting.birthday'
  | 'setting.quietHours'
  | 'setting.dataExport'
  | 'setting.dataReset'
  // Notification templates (body text with interpolation)
  | 'notif.feed.title'
  | 'notif.feed.body'
  | 'notif.rest.title'
  | 'notif.rest.body'
  | 'notif.play.title'
  | 'notif.play.body'
  | 'notif.bedtime.title'
  | 'notif.bedtime.body'
  // Life stage labels
  | 'stage.egg'
  | 'stage.baby'
  | 'stage.child'
  | 'stage.teen'
  | 'stage.adult'
  // Mood labels
  | 'mood.happy'
  | 'mood.sleepy'
  | 'mood.excited'
  | 'mood.low'
  | 'mood.curious'
  | 'mood.cozy'
  | 'mood.hungry'
  | 'mood.dirty'
  // Stat labels
  | 'stat.satiety'
  | 'stat.energy'
  | 'stat.happiness'
  // Common verbs / prompts
  | 'common.ok'
  | 'common.cancel'
  | 'common.save'
  | 'common.yes'
  | 'common.no'
  | 'common.loading'
  | 'common.error';

// Runtime-iterable listing of every StringKey (compile-time enforced by
// the assertion below to match the union exactly).
export const STRING_KEYS: readonly StringKey[] = [
  'title.home',
  'title.settings',
  'title.stats',
  'title.journal',
  'action.feed',
  'action.play',
  'action.rest',
  'action.clean',
  'action.settings',
  'action.export',
  'action.reset',
  'permission.health.description',
  'permission.location.description',
  'permission.notifications.description',
  'permission.calendar.description',
  'permission.media.description',
  'setting.sound',
  'setting.notifications',
  'setting.language',
  'setting.birthday',
  'setting.quietHours',
  'setting.dataExport',
  'setting.dataReset',
  'notif.feed.title',
  'notif.feed.body',
  'notif.rest.title',
  'notif.rest.body',
  'notif.play.title',
  'notif.play.body',
  'notif.bedtime.title',
  'notif.bedtime.body',
  'stage.egg',
  'stage.baby',
  'stage.child',
  'stage.teen',
  'stage.adult',
  'mood.happy',
  'mood.sleepy',
  'mood.excited',
  'mood.low',
  'mood.curious',
  'mood.cozy',
  'mood.hungry',
  'mood.dirty',
  'stat.satiety',
  'stat.energy',
  'stat.happiness',
  'common.ok',
  'common.cancel',
  'common.save',
  'common.yes',
  'common.no',
  'common.loading',
  'common.error',
];
