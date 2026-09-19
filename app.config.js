const appConfig = require('./app.json');

module.exports = {
  ...appConfig.expo,
  extra: {
    ...(appConfig.expo?.extra || {}),
    posthogProjectToken:
      process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN ||
      process.env.POSTHOG_PROJECT_TOKEN,
    posthogHost:
      process.env.EXPO_PUBLIC_POSTHOG_HOST ||
      process.env.POSTHOG_HOST ||
      'https://us.i.posthog.com',
  },
};
