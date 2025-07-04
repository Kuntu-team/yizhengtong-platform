import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        p.person_id as id, 
        p.person_photo_url as avatar, 
        p.person_name as name, 
        p.department, 
        p.position, 
        p.region_cn as region, 
        p.birth_date as birth_date, 
        c.wechat_number as wechat 
      FROM 
        key_person_base_info p 
      LEFT JOIN 
        key_person_private_info c 
      ON 
        p.person_id = c.person_id;
    `;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch key persons data' },
      { status: 500 }
    );
  }
}