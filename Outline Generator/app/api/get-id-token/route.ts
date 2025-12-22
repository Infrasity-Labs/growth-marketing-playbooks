import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
      const token = cookies().get('token')?.value;
      if (!token) {
          return NextResponse.json({ error: 'No token available' }, { status: 401 });
        }
      
      return NextResponse.json({ token });
    } catch (error) {
      console.error(error);
      return NextResponse.json({error: 'Internal server Error'}, {status: 500})
    }
}
