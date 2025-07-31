import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['warn', 'error'],
    // 优化连接池配置以支持高并发
    datasourceUrl: process.env.DATABASE_URL + '?connection_limit=50&pool_timeout=20&connect_timeout=10',
    // 优化连接池配置
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;