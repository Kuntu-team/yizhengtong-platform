import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const regions = await prisma.$queryRaw`\
      SELECT province_code, province_cn, city_code, city_cn, district_code, district_cn\
      FROM dim_region_code_dh\
      ORDER BY province_code ASC, city_code ASC, district_code ASC\
    `;
    return NextResponse.json({ success: true, data: regions });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
} 