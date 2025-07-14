/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  devIndicators: false,
  output: "standalone", // 添加 standalone 输出模式配置
  distDir: 'next', // 删除自定义产物目录，恢复默认 .next
  allowedDevOrigins: [//只在开发环境下生效，处理跨域警告，线上环境不执行
    "http://localhost:3000",
    "http://192.168.30.48:3000"
  ],
}

export default nextConfig