module.exports = {
  apps: [
    {
      name: "neclms-api",
      script: "server/index.js",
      instances: "max",           // Scale across all CPU cores
      exec_mode: "cluster",       // Enable PM2 cluster mode for horizontal scaling
      watch: false,               // Disable watch in production
      max_memory_restart: "2G",   // Restart if memory exceeds 2GB
      env_production: {
        NODE_ENV: "production",
        PORT: 8080,
        // Other env vars injected by server environment
      },
      log_date_format: "YYYY-MM-DD HH:mm Z",
      error_file: "./logs/neclms-err.log",
      out_file: "./logs/neclms-out.log",
      merge_logs: true,
      time: true
    }
  ]
};
