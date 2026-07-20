export const DEVICE_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
};

export const DEVICE_COMMANDS = {
  SCREENSHOT: 'screenshot',
  RING: 'ring',
  LOCK: 'lock',
  LOST_MODE: 'lost-mode',
  FLASHLIGHT: 'flashlight',
  VIBRATE: 'vibrate',
  VOLUME: 'volume',
  NOTIFICATION: 'notification',
  SYNC: 'sync',
  REFRESH: 'refresh',
};

export const NOTIFICATION_TYPES = {
  DEVICE_ONLINE: 'device:online',
  DEVICE_OFFLINE: 'device:offline',
  DEVICE_NEW: 'device:new',
  ACTIVATION_SUCCESS: 'activation:success',
  DEVICE_DEACTIVATED: 'device:deactivated',
  MONITORING_ERROR: 'monitoring:error',
};

export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  AUTHENTICATE: 'authenticate',
  DEVICE_ONLINE: 'device:online',
  DEVICE_OFFLINE: 'device:offline',
  DEVICE_STATUS: 'device:status',
  DEVICE_NEW: 'device:new',
  DEVICE_UPDATED: 'device:updated',
  MONITORING_SCREENSHOT: 'monitoring:screenshot',
  MONITORING_LOCATION: 'monitoring:location',
  MONITORING_ACTIVITY: 'monitoring:activity',
  CONTROL_RESULT: 'control:result',
  NOTIFICATION_NEW: 'notification:new',
};

export const API_ENDPOINTS = {
  DEVICES: '/devices',
  DEVICE_STATS: '/devices/stats',
  DEVICE_HISTORY: '/devices/history',
  DEVICE_INVITE: '/devices/invite',
  MONITORING: '/monitoring',
  CONTROL: '/control',
  AUTH_VERIFY: '/auth/verify',
  HEALTH: '/health',
};

export const STORAGE_KEYS = {
  THEME: 'theme',
  SIDEBAR_STATE: 'sidebarState',
  REMEMBER_ME: 'rememberMe',
};
