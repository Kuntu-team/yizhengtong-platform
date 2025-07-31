import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 简单的内存缓存，用于存储查询结果
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 增加到10分钟缓存

// 添加请求计数器用于监控
let requestCount = 0;
let errorCount = 0;
let cacheHitCount = 0;

// 添加性能监控
const performanceStats = {
  avgResponseTime: 0,
  totalRequests: 0,
  totalResponseTime: 0
};

export async function GET(request: Request) {
  const startTime = Date.now();
  requestCount++;
  
  try {
    const url = new URL(request.url);
    const businessPersonId = url.searchParams.get("businessPersonId");
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "30", 10);
    const skip = (page - 1) * pageSize;
    
    if (!businessPersonId) {
      return NextResponse.json({ data: [], total: 0 });
    }

    // 检查缓存 - 增加缓存命中率
    const cacheKey = `${businessPersonId}:${page}:${pageSize}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      cacheHitCount++;
      const responseTime = Date.now() - startTime;
      return NextResponse.json({
        ...cached.data,
        responseTime: `${responseTime}ms`,
        cached: true,
        requestCount,
        errorCount,
        cacheHitCount,
        cacheHitRate: `${((cacheHitCount / requestCount) * 100).toFixed(2)}%`
      });
    }

    // 1. 查找该商务负责的所有区域 - 添加超时控制
    const managerRegions = await Promise.race([
      prisma.business_manager_region_info.findMany({
        where: { business_person_id: businessPersonId },
        select: { region_code: true, region_level: true }
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 3000) // 减少超时时间
      )
    ]) as any[];
    
    if (!managerRegions || managerRegions.length === 0) {
      return NextResponse.json({ data: [], total: 0 });
    }

    // 2. 构造查询条件
    const regionConditions: { field: string; codes: string[] }[] = [];
    const level1Codes: string[] = [];
    const level2Codes: string[] = [];
    const level3Codes: string[] = [];
    
    for (const region of managerRegions) {
      if (region.region_level === "1") {
        level1Codes.push(region.region_code || '');
      } else if (region.region_level === "2") {
        level2Codes.push(region.region_code || '');
      } else if (region.region_level === "3") {
        level3Codes.push(region.region_code || '');
      }
    }
    
    if (level1Codes.length > 0) regionConditions.push({ field: "province_code", codes: level1Codes });
    if (level2Codes.length > 0) regionConditions.push({ field: "city_code", codes: level2Codes });
    if (level3Codes.length > 0) regionConditions.push({ field: "district_code", codes: level3Codes });

    // 3. 使用单个查询获取所有关键人 - 添加超时控制
    const whereConditions = regionConditions.map(cond => ({
      [cond.field]: { in: cond.codes }
    }));
    
    const allKeyPersons = await Promise.race([
      prisma.key_person_base_info.findMany({
        where: {
          OR: whereConditions
        },
        select: {
          person_id: true,
          person_name: true,
          person_photo_url: true,
          department_code: true,
          position_code: true,
          position: true,
          region_cn: true,
          birth_date: true,
          office_phone: true,
          leadership_division: true,
          person_desc: true
        }
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 3000) // 减少超时时间
      )
    ]) as any[];

    // 4. 去重
    const uniqueKeyPersons = Array.from(
      new Map(allKeyPersons.map((item) => [item.person_id, item])).values()
    );
    const total = uniqueKeyPersons.length;

    // 5. 分页
    const pagedKeyPersons = uniqueKeyPersons.slice(skip, skip + pageSize);

    // 6. 批量查询关联数据 - 优化查询策略
    const personIds = pagedKeyPersons.map(k => k.person_id);
    const deptPositionCodes = pagedKeyPersons
      .filter(k => k.department_code && k.position_code)
      .map(k => ({ department_code: k.department_code!, position_code: k.position_code! }));

    // 并行执行批量查询以提高性能
    const [deptPositions, privateInfos] = await Promise.all([
      deptPositionCodes.length > 0 ? prisma.dim_dept_position_code.findMany({
        where: {
          OR: deptPositionCodes
        }
      }) : Promise.resolve([]),
      personIds.length > 0 ? prisma.key_person_private_info.findMany({
        where: {
          person_id: { in: personIds }
        },
        select: { person_id: true, wechat_number: true }
      }) : Promise.resolve([])
    ]);

    // 创建查找映射
    const deptPositionMap = new Map(
      deptPositions.map(dp => [`${dp.department_code}-${dp.position_code}`, dp])
    );
    const privateInfoMap = new Map(
      privateInfos.map(pi => [pi.person_id, pi])
    );

    // 7. 组装结果
    const results = pagedKeyPersons.map(k => {
      const deptPosition = k.department_code && k.position_code 
        ? deptPositionMap.get(`${k.department_code}-${k.position_code}`)
        : null;
      const privateInfo = privateInfoMap.get(k.person_id);
      
      return {
        id: k.person_id,
        name: k.person_name,
        avatar: k.person_photo_url,
        department: deptPosition?.department || "",
        position: k.position || "",
        region: k.region_cn,
        birth_date: k.birth_date,
        office_phone: k.office_phone,
        wechat: privateInfo?.wechat_number || "",
        leadership_division: k.leadership_division,
        person_desc: k.person_desc,
      };
    });

    const responseData = { data: results, total };
    
    // 缓存结果 - 增加缓存大小限制
    if (cache.size < 1000) { // 限制缓存条目数
      cache.set(cacheKey, { data: responseData, timestamp: Date.now() });
    }
    
    // 清理过期缓存
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > CACHE_DURATION) {
        cache.delete(key);
      }
    }

    const responseTime = Date.now() - startTime;
    
    // 更新性能统计
    performanceStats.totalRequests++;
    performanceStats.totalResponseTime += responseTime;
    performanceStats.avgResponseTime = performanceStats.totalResponseTime / performanceStats.totalRequests;
    
    return NextResponse.json({
      ...responseData,
      responseTime: `${responseTime}ms`,
      cached: false,
      requestCount,
      errorCount,
      cacheHitCount,
      cacheHitRate: `${((cacheHitCount / requestCount) * 100).toFixed(2)}%`,
      avgResponseTime: `${performanceStats.avgResponseTime.toFixed(2)}ms`
    });
  } catch (error) {
    errorCount++;
    console.log("Database query error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch key persons data",
        requestCount,
        errorCount,
        cacheHitCount,
        cacheHitRate: `${((cacheHitCount / requestCount) * 100).toFixed(2)}%`
      },
      { status: 500 }
    );
  }
}
