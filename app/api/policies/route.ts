import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const businessPersonId = url.searchParams.get('businessPersonId');
    if (!businessPersonId) {
      return NextResponse.json({ success: false, error: 'Missing businessPersonId' }, { status: 400 });
    }

    // 1. 获取该商务负责人的所有 distinct region_code
    const regionInfos = await prisma.business_manager_region_info.findMany({
      where: { business_person_id: businessPersonId },
      select: { region_code: true },
      distinct: ['region_code'],
    });
    const regionCodes = regionInfos.map(r => r.region_code).filter(Boolean);
    const regionCodeSubstrs = regionCodes.map(code => code?.substring(2)); // substr from 3rd char (0-based)

    // 2. 查询 region_level = '0' 的政策
    const policies0 = await prisma.policies_info.findMany({
      where: { region_level: '0' },
      select: { policy_id: true, region_level: true, released_date: true },
    });

    // 3. 查询 region_level in ('1','2') 的政策
    const policies12 = await prisma.policies_info.findMany({
      where: { region_level: { in: ['1', '2'] } },
      select: { policy_id: true, region_level: true, released_date: true, region_code: true },
    });
    const matchedPolicies12 = policies12.filter(p => {
      const codeSubstr = p.region_code?.substring(2);
      return codeSubstr && regionCodeSubstrs.includes(codeSubstr);
    });

    // 4. 合并
    const allPolicies = [
      ...policies0,
      ...matchedPolicies12,
    ];

    // 5. 排序（region_level: 2 > 1 > 0, released_date desc）
    const levelOrder = (level: string | null | undefined) => {
      if (level === '2') return 1;
      if (level === '1') return 2;
      if (level === '0') return 3;
      return 4;
    };
    allPolicies.sort((a, b) => {
      const levelDiff = levelOrder(a.region_level) - levelOrder(b.region_level);
      if (levelDiff !== 0) return levelDiff;
      // released_date 可能为 null，做类型保护
      const dateA = a.released_date ? new Date(a.released_date) : new Date(0);
      const dateB = b.released_date ? new Date(b.released_date) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    // 6. row_number
    const result = allPolicies.map((item, idx) => ({
      ...item,
      rn: idx + 1,
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
} 