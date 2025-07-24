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
  // distDir: 'next', 
  // allowedDevOrigins: [ //本地测试使用允许跨域使用
  //   '192.168.30.117',
  //   'localhost',
  //   '127.0.0.1'
  // ],
}

export default nextConfig