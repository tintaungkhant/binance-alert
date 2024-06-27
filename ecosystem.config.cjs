module.exports = {
  apps: [
    {
      script: 'build/start_scraper.js',
      cron_restart: "0 * * * *"
    },
  ],
};
