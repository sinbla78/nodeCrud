module.exports = {
  apps: [
    {
      name: 'live-cursor',
      script: 'node_modules/.bin/ts-node',
      args: 'src/index.ts',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 4000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    }
  ]
};
