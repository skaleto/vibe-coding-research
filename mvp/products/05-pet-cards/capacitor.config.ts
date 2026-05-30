import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.petcards.app',
  appName: '宠物心情卡片',
  webDir: 'dist',
  android: {
    // A5-09 加固：禁止 https 页面加载 http 资源
    allowMixedContent: false,
    // android.permission.RECORD_AUDIO 由 capacitor-voice-recorder 自动注入
  },
  ios: {
    // 必须在 ios/App/App/Info.plist 加：
    //   <key>NSMicrophoneUsageDescription</key>
    //   <string>用于录制宠物叫声并生成萌系心情卡片</string>
    // CapacitorUpdater + VoiceRecorder 共用此权限
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
  },
};

export default config;
