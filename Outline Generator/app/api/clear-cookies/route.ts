import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Cookies Cleared' });

  response.cookies.set('token', '', { httpOnly: true, secure: true, expires: new Date(0) }); // Commented out to disable cookie clearing
  response.cookies.set('refresh_token', '', { httpOnly: true, secure: true, expires: new Date(0) }); // Commented out to disable cookie clearing

  return response;
}
