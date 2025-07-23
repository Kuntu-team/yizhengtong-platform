import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const businessPersonId = url.searchParams.get("businessPersonId");
    if (!businessPersonId) {
      return NextResponse.json([]);
    }

    // 1. 查找该商务负责的所有区域
    const managerRegions = await prisma.business_manager_region_info.findMany({
      where: { business_person_id: businessPersonId },
    });
    if (!managerRegions || managerRegions.length === 0) {
      return NextResponse.json([]);
    }

    // 2. 按区域类型分组，构造查询条件
    const regionConditions: { field: string; code: string }[] = [];
    for (const region of managerRegions) {
      if (region.region_level === "1") {
        regionConditions.push({ field: "province_code", code: region.region_code || '' });
      } else if (region.region_level === "2") {
        regionConditions.push({ field: "city_code", code: region.region_code || '' });
      } else if (region.region_level === "3") {
        regionConditions.push({ field: "district_code", code: region.region_code || '' });
      }
    }

    // 3. 合并所有区域的关键人
    let allKeyPersons: any[] = [];
    for (const cond of regionConditions) {
      const keyPersons = await prisma.key_person_base_info.findMany({
        where: { [cond.field]: cond.code },
      });
      allKeyPersons = allKeyPersons.concat(keyPersons);
    }

    // 4. 去重（如果有同一个人出现在多个区域）
    const uniqueKeyPersons = Array.from(
      new Map(allKeyPersons.map((item) => [item.person_id, item])).values()
    );

    // 5. 查 dim_dept_position_code 和 key_person_private_info 并组装结果
    const results = await Promise.all(
      uniqueKeyPersons.map(async (k) => {
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
          department: deptPosition?.department || "",
          position: k.position || "", // 直接用key_person_base_info表的position字段
          region: k.region_cn,
          birth_date: k.birth_date,
          office_phone: k.office_phone,
          wechat: privateInfo?.wechat_number || "",
          leadership_division: k.leadership_division,
          person_desc: k.person_desc,
        };
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.log("Database query error:", error);
    return NextResponse.json(
      { error: "Failed to fetch key persons data" },
      { status: 500 }
    );
  }
}
