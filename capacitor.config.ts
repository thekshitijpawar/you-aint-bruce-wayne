import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.brucewayne.moneytracker',
  appName: "You Ain't Bruce Wayne",
  webDir: 'dist',
  server: {
    url: 'https://you-aint-bruce-wayne.vercel.app',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      notifications: [
        {
          id: 1,
          title: "You Ain't Bruce Wayne",
          body: "Time to record your expenses! 💰",
          schedule: { repeating: { every: 24 * 60 * 60 * 1000 } }
        }
      ]
    }
  }
};

export default config;
