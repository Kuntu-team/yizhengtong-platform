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
  // distDir: 'next', // 删除自定义产物目录，恢复默认 .next
}

export default nextConfig