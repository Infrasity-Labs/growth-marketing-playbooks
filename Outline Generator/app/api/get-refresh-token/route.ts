import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    
    const refreshToken = cookies().get('refresh_token')?.value;
    if (!refreshToken) {
        return NextResponse.json({ error: 'No token available' }, { status: 401 });
      }
    
    return NextResponse.json({ refreshToken });
}
