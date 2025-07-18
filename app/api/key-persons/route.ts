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

    // 1. 查找 business_manager_region_info
    const managerRegion = await prisma.business_manager_region_info.findFirst({
      where: { business_person_id: businessPersonId },
    });
    if (!managerRegion) {
      return NextResponse.json([]);
    }

    // 2. 构造 region 查询条件
    let regionField = '';
    if (managerRegion.region_level === '1') regionField = 'province_code';
    if (managerRegion.region_level === '2') regionField = 'city_code';
    if (managerRegion.region_level === '3') regionField = 'district_code';
    if (!regionField) {
      return NextResponse.json([]);
    }

    // 3. 查找关键人
    const keyPersons = await prisma.key_person_base_info.findMany({
      where: {
        [regionField]: managerRegion.region_code,
      },
    });

    // 4. 查 dim_dept_position_code 和 key_person_private_info 并组装结果
    const results = await Promise.all(keyPersons.map(async (k) => {
      let deptPosition = null;
      if (k.department_code && k.position_code) {
        deptPosition = await prisma.dim_dept_position_code.findFirst({
          where: {
            department_code: k.department_code,
            position_code: k.position_code,
          },
        });
      }
      const privateInfo = await prisma.key_person_private_info.findUnique({
        where: { person_id: k.person_id },
      });
      return {
        id: k.person_id,
        name: k.person_name,
        avatar: k.person_photo_url,
        department: deptPosition?.department || '',
        position: deptPosition?.position || '',
        region: k.region_cn,
        birth_date: k.birth_date,
        office_phone: k.office_phone,
        wechat: privateInfo?.wechat_number || '',
        leadership_division: k.leadership_division,
        person_desc: k.person_desc,
      };
    }));

    console.log('Query result count:', results.length, 'for businessPersonId:', businessPersonId);
    return NextResponse.json(results);
  } catch (error) {
    console.log('Database query error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch key persons data' },
      { status: 500 }
    );
  }
}