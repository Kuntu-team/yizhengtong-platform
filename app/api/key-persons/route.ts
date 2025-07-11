import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const businessPersonId = url.searchParams.get('businessPersonId');
    if (!businessPersonId) {
      console.log('No businessPersonId provided, returning empty result');
      return NextResponse.json([]);
    }
    console.log('Received businessPersonId:', businessPersonId);
    
    const result = await prisma.$queryRaw`
      SELECT 
        k.person_id as id, 
        k.person_name as name, 
        k.person_photo_url as avatar, 
        d.department as department, 
        d.position as position, 
        k.region_cn as region, 
        k.birth_date as birth_date,
        k.office_phone as office_phone,
        c.wechat_number as wechat,
        k.leadership_division,
        k.person_desc
      FROM 
        (select t.* 
         from key_person_base_info t 
         inner join (select 
           business_person_id, region_code, region_cn, region_level 
           from business_manager_region_info 
           where cast(business_person_id as uuid) = cast(${businessPersonId} as uuid)
         ) t1 
         on case 
           when t1.region_level = '1' then t1.region_code = t.province_code 
           when t1.region_level = '2' then t1.region_code = t.city_code 
           when t1.region_level = '3' then t1.region_code = t.district_code 
         end 
        ) k 
      LEFT JOIN 
        dim_dept_position_code d 
      ON 
        k.department_code = d.department_code 
        AND k.position_code = d.position_code 
      LEFT JOIN 
        key_person_private_info c 
      ON 
        k.person_id = c.person_id;
    `;
    console.log('Query result count:', Array.isArray(result) ? result.length : 0, 'for businessPersonId:', businessPersonId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch key persons data' },
      { status: 500 }
    );
  }
}