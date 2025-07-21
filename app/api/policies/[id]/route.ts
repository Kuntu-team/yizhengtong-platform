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

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { query, inputs, response_mode, conversation_id, user, files } = body;

  // 构造 dify 请求参数
  const difyBody = JSON.stringify({
    query,
    inputs: { ...inputs, policy_id: id },
    response_mode: response_mode || 'blocking',
    conversation_id: conversation_id || '',
    user: user || 'wby',
    files: files || [],
  });

  // 选择流式还是阻塞
  const isStreaming = response_mode === 'streaming';

  // 代理到 dify
  const difyToken = process.env.DIFY_TOKEN_POLICIES;
  if (!difyToken) {
    return NextResponse.json({ success: false, error: 'DIFY token not set in environment variables' }, { status: 500 });
  }
  const difyRes = await fetch('http://47.94.55.173:8088/v1/chat-messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${difyToken}`,
    },
    body: difyBody,
  });

  if (isStreaming) {
    // 直接转发流式响应
    return new Response(difyRes.body, {
      status: difyRes.status,
      headers: {
        'Content-Type': difyRes.headers.get('Content-Type') || 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } else {
    // 普通 JSON
    const data = await difyRes.json();
    return NextResponse.json(data, { status: difyRes.status });
  }
} 