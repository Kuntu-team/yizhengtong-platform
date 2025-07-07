import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import prisma from '@/lib/prisma';

// 兜底id->name映射（极少数特殊情况）
const idToName: Record<string, string> = {
  'cc708d47-02ae-4429-83f5-33dd21f28014': '李忠兴',
  // 可继续添加特殊id
};

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { searchParams } = new URL(req.url);
  let name = searchParams.get('name');

  // 没有name参数时，自动查库
  if (!name) {
    const person = await prisma.key_person_base_info.findUnique({
      where: { person_id: id },
      select: { person_name: true }
    });
    name = person?.person_name ?? null;
  }
  // 兜底idToName
  if (!name) name = idToName[id];
  if (!name) return NextResponse.json([], { status: 404 });

  const searchUrl = `https://baike.baidu.com/item/${encodeURIComponent(name)}`;
  try {
    const { data } = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36'
      }
    });
    const $ = cheerio.load(data);
    const resumeDivs = $('div.para_e7uVn.content_rwkQk.MARK_MODULE');
    let resumeLines: string[] = [];
    resumeDivs.each((i, el) => {
      const text = $(el).text().trim();
      if (text) resumeLines.push(text);
    });
    // 只返回 organization 字段
    const result = resumeLines.map(line => ({ organization: line }));

    // 更新数据库 work_experience 字段（text类型，存json字符串）
    await prisma.key_person_base_info.update({
      where: { person_id: id },
      data: { work_experience: JSON.stringify(result) }
    });

    return NextResponse.json(result);
  } catch (e) {
    // 爬取失败时，从数据库取work_experience字段
    console.error('爬取失败，尝试从数据库读取', e);
    const person = await prisma.key_person_base_info.findUnique({
      where: { person_id: id },
      select: { work_experience: true }
    });
    if (person?.work_experience) {
      return NextResponse.json(JSON.parse(person.work_experience));
    }
    return NextResponse.json([], { status: 500 });
  }
} 