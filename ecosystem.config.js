/**
 * PM2 生产环境配置文件
 * 用于集群模式部署和负载均衡
 * 
 * 注意：
 * - 敏感信息通过环境变量传递
 * - 此文件可以安全提交到Git
 * - 生产环境需要设置 DATABASE_URL 等环境变量
 * 
 * 云服务器配置建议：
 * - 2核4GB: max_memory_restart: '1G'
 * - 4核8GB: max_memory_restart: '2G'
 * - 8核16GB: max_memory_restart: '3G'
 * - 16核32GB: max_memory_restart: '4G'
 * - 32核64GB: max_memory_restart: '6G'
 */
module.exports = {
  apps: [
    {
      name: 'yizhengtong-platform',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        NODE_OPTIONS: '--max-old-space-size=4096 --max-semi-space-size=512',
        CACHE_ENABLED: 'true',
      },
      // 内存限制配置 - 根据云服务器配置调整
      max_memory_restart: '4G',  // 当前配置：适合16核32GB服务器
      // 云服务器配置建议：
      // max_memory_restart: '1G',  // 2核4GB服务器
      // max_memory_restart: '2G',  // 4核8GB服务器
      // max_memory_restart: '3G',  // 8核16GB服务器
      // max_memory_restart: '4G',  // 16核32GB服务器（当前）
      // max_memory_restart: '6G',  // 32核64GB服务器
      
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      pmx: true,
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
    }
  ]
}; 