import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 等待params解析
    const resolvedParams = await params;
    const { id } = resolvedParams;
    // 执行原始SQL查询并返回所有字段
    const result = await prisma.$queryRaw`
      SELECT k.*, p.* 
      FROM 
        key_person_base_info k 
      LEFT JOIN 
        key_person_private_info p ON k.person_id = p.person_id 
      WHERE k.person_id = ${id}
    `;

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return NextResponse.json(null, { status: 404 });
    }

    // 返回原始数据，不进行字段转换
    return NextResponse.json((result as unknown[])[0]);
  } catch (error) {
    console.error('Error fetching person data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch person data' },
      { status: 500 }
    );
  }
}