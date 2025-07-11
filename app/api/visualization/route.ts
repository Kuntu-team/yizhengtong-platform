import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const region_code = searchParams.get('region_code');
  const year_dim = searchParams.get('year_dim');

  // 构建查询条件
  const where: any = {};
  if (region_code) where.region_code = region_code;
  if (year_dim) where.year_dim = year_dim;

  try {
    const stats = await prisma.region_special_bond_stats.findMany({
      where,
      select: {
        region_code: true,
        region_name: true,
        year_dim: true,
        project_amount: true,
        issued_amount: true,
      },
      orderBy: [{ region_code: 'asc' }],
    });

    // BigInt 转字符串，Decimal 也转字符串
    const safeStats = stats.map(item => ({
      ...item,
      project_amount: item.project_amount !== null && item.project_amount !== undefined ? item.project_amount.toString() : null,
      issued_amount: item.issued_amount !== null && item.issued_amount !== undefined ? item.issued_amount.toString() : null,
    }));

    return NextResponse.json({ success: true, data: safeStats });
  } catch (error) {
    // 增强日志输出
    console.error('API /api/visualization error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
} 