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

    // 2. 查询 region_level in ('1','2') 的政策
    const policies12 = await prisma.policies_info.findMany({
      where: {
        region_level: { in: ['1', '2'] },
      },
      select: { policy_id: true, region_code: true },
    });
    // 只保留 region_code substr(3) 匹配的
    const matchedPolicies12 = policies12.filter(p => {
      const codeSubstr = p.region_code?.substring(2);
      return codeSubstr && regionCodeSubstrs.includes(codeSubstr);
    });

    // 3. 查询 region_level = '0' 的政策
    const policies0 = await prisma.policies_info.findMany({
      where: { region_level: '0' },
      select: { policy_id: true },
    });

    // 4. 合并 policy_id 并去重
    const allPolicyIds = [
      ...matchedPolicies12.map(p => p.policy_id),
      ...policies0.map(p => p.policy_id),
    ];
    const uniquePolicyIds = Array.from(new Set(allPolicyIds));

    return NextResponse.json({ success: true, data: uniquePolicyIds });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
} 