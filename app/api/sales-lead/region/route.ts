// import prisma from "@/lib/prisma";
// import { NextResponse } from "next/server";
// export async function GET(request: Request) {
//   const targetBusinessPersonId = "e7558fb6-234c-475d-82b9-79db46840389";
//   // const targetBusinessPersonId = "d3c26b38-d36b-4cbb-9e4c-9a366a706c42";

//   const regionInfos = await prisma.business_manager_region_info.findMany({
//     where: {
//       business_person_id: targetBusinessPersonId,
//     },
//   });

//   if (regionInfos.length === 0) {
//     return NextResponse.json(
//       { error: "No region info found" },
//       { status: 404 }
//     );
//   }

//   const regionCodes = regionInfos
//     .map((info) => info.region_code)
//     .filter((code): code is string => code !== null);
//   const regionLevel = regionInfos[0].region_level;

//   const whereCondition = {
//     region_code: { in: regionCodes },
//     region_level: regionLevel,
//   };

//   const matchedPersons = await prisma.key_person_base_info.findMany({
//     where: whereCondition,
//   });
//   return NextResponse.json({
//     region_info: regionInfos,
//     person_info: matchedPersons,
//   });
// }
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function GET(request: Request) {
  const cookies = request.headers.get("cookie");

  // 解析 cookie 字符串为对象
  const cookieObject = Object.fromEntries(
    (cookies || "")
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const [key, ...rest] = cookie.split("=");
        return [key, rest.join("=")];
      })
  );

  const targetBusinessPersonId = cookieObject["business_person_id"] || "";

  const regionInfos = await prisma.business_manager_region_info.findMany({
    where: {
      business_person_id: targetBusinessPersonId,
    },
  });

  if (regionInfos.length === 0) {
    return NextResponse.json(
      { error: "No region info found" },
      { status: 404 }
    );
  }

  const regionLevel = regionInfos[0].region_level;
  const regionCodes = regionInfos.map((info) => info.region_code);

  let whereCondition = {};

  switch (regionLevel) {
    case "1":
      whereCondition = { province_code: { in: regionCodes } };
      break;
    case "2":
      whereCondition = { city_code: { in: regionCodes } };
      break;
    case "3":
      whereCondition = { district_code: { in: regionCodes } };
      break;
    default:
      return NextResponse.json(
        { error: "Invalid region level" },
        { status: 400 }
      );
  }

  const matchedPersons = await prisma.key_person_base_info.findMany({
    where: whereCondition,
  });

  return NextResponse.json({
    region_info: regionInfos,
    person_info: matchedPersons,
  });
}
