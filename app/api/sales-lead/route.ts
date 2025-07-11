import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function GET(request: Request) {
  try {
    const news = await prisma.key_person_news.findMany();
    const persons = await prisma.key_person_base_info.findMany();
    const tags = await prisma.key_person_news_tags.findMany();
    const private_info = await prisma.key_person_private_info.findMany();
    const result = news.map((item) => {
      const person = persons.find((p) => p.person_id === item.person_id);
      const person_private = private_info.find(
        (p) => p.person_id === item.person_id
      );
      const newTag = tags.find((t) => t.news_id === item.news_id);
      return {
        ...item,
        person_name: person?.person_name || null,
        tags_name: newTag?.tags || null,
        person_private: person_private,
        position:
          (person?.region_cn ?? "") +
          (person?.department ?? "") +
          (person?.position ?? ""),
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.log("Error fetching sales leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales leads" },
      { status: 500 }
    );
  }
}
