import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const {token} = await req.json();
  cookies().set('token', token, { httpOnly: true, secure: true }); // Commented out to disable cookie storing
  return NextResponse.json("Cookie set");
}
