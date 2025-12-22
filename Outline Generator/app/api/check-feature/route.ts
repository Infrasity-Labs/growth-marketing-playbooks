import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {

    const id = req.nextUrl.searchParams.get('id') as string;

    const visibleToUsers: string[] = JSON.parse(
      process.env.VISIBLE_TO_USERS || "[]"
    );

    const result = visibleToUsers.includes(id);

    return NextResponse.json({result: result}, {status: 200});
  } catch (error) {
    console.error(error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500})
  }
}
