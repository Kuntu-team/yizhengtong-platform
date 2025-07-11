import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const policies = await prisma.policies_info.findMany({
      orderBy: { released_date: 'desc' },
    });
    return NextResponse.json({ success: true, data: policies });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
} 