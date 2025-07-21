import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 查询部门和职位数据
    const deptPositions = await prisma.dim_dept_position_code.findMany({
      select: {
        department: true,
        position: true,
      },
      where: {
        department: {
          not: null,
        },
        position: {
          not: null,
        },
      },
    });

    // 格式化数据为部门-职位层级结构
    const result: Record<string, string[]> = {};
    deptPositions.forEach((item) => {
      const dept = item.department!;
      const pos = item.position!;
      if (!result[dept]) {
        result[dept] = ["全部岗位"];
      }
      if (!result[dept].includes(pos)) {
        result[dept].push(pos);
      }
    });

    // 添加"全部部门"选项
    result["全部部门"] = ["全部岗位"];

    console.log("Fetched department positions:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.log("Error fetching department positions:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
