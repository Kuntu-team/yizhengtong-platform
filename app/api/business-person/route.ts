import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function GET(request: Request) { 
    const users = await prisma.business_person_base_info.findMany()
    return NextResponse.json(users)
}
