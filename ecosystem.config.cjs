module.exports = {
  apps: [
    {
      name: "cpw-reliability",
      cwd: __dirname,
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
      },
      instances: 1,
      autorestart: true,
      max_restarts: 20,
      watch: false,
    },
  ],
};
