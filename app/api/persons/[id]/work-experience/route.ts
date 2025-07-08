import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // 只查数据库 work_experience 字段
  const person = await prisma.key_person_base_info.findUnique({
    where: { person_id: id },
    select: { work_experience: true }
  });
  if (person?.work_experience) {
    try {
      return NextResponse.json(JSON.parse(person.work_experience));
    } catch {
      // 解析失败，返回原始字符串
      return NextResponse.json(person.work_experience);
    }
  }
  return NextResponse.json([], { status: 404 });
} 