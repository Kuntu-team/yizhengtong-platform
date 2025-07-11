import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const regions = await prisma.dim_region_code_dh.findMany({
      orderBy: [
        { province_code: 'asc' },
        { city_code: 'asc' },
        { district_code: 'asc' },
      ],
    });
    return NextResponse.json({ success: true, data: regions });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
} 