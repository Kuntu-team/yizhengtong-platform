import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get('url');
  if (!imageUrl) {
    return new Response('Missing url parameter', { status: 400 });
  }
  try {
    const res = await fetch(imageUrl, { headers: { 'Referer': '' } });
    if (!res.ok) {
      return new Response('Failed to fetch image', { status: 502 });
    }
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await res.arrayBuffer();
    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (e) {
    return new Response('Error fetching image', { status: 500 });
  }
} 