import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.dreamjournal.app',
  appName: '梦境日记',
  webDir: 'dist',
  android: {
    // A5-09 加固：禁止 https 页面加载 http 资源
    allowMixedContent: false,
  },
  server: {
    // A5-09 加固：所有远端（gateway / ota-backend）均部署在 Cloudflare 强制 https，
    // 客户端无需明文 HTTP。androidScheme 用 https（Capacitor 8 默认），cleartext 关闭强制 TLS。
    androidScheme: 'https',
    cleartext: false,
  },
  plugins: {
    CapacitorUpdater: {
      autoUpdate: false,
      appReadyTimeout: 15000,
      responseTimeout: 120,
      autoDeleteFailed: true,
      autoDeletePrevious: true,
      resetWhenUpdate: true,
      statsUrl: '',
    },
    SpeechRecognition: {
      // iOS Info.plist: NSMicrophoneUsageDescription, NSSpeechRecognitionUsageDescription
      // Android manifest: RECORD_AUDIO permission
    },
  },
  ios: {
    contentInset: 'always',
  },
};

export default config;
