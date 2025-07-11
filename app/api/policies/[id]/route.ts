import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const policy = await prisma.policies_info.findUnique({
      where: { policy_id: id },
    });
    if (!policy) {
      return NextResponse.json({ success: false, error: 'Policy not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: policy });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
} 