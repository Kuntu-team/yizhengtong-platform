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

    // 1. 查找 key_person_base_info
    const person = await prisma.key_person_base_info.findUnique({
      where: { person_id: id },
    });
    if (!person) {
      return NextResponse.json(null, { status: 404 });
    }

    // 2. 查找 key_person_private_info
    const privateInfo = await prisma.key_person_private_info.findUnique({
      where: { person_id: id },
    });

    // 3. 合并数据
    const result = {
      ...person,
      ...privateInfo,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching person data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch person data' },
      { status: 500 }
    );
  }
}