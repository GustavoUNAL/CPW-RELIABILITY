/**
 * PM2 — Reliability Analytics (opsai.space)
 *
 * Uso en el servidor:
 *   npm ci
 *   npm run build
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 *   pm2 startup
 */
module.exports = {
  apps: [
    {
      name: "opsai-reliability",
      cwd: __dirname,
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
        HOST: "127.0.0.1",
        PORT: "4173",
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 20,
      min_uptime: "10s",
      restart_delay: 3000,
      watch: false,
      max_memory_restart: "512M",
      time: true,
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      merge_logs: true,
    },
  ],
};
