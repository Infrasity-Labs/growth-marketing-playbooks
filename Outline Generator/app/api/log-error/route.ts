import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {errors} = await req.json();
    console.log(errors);
    return NextResponse.json("Errors logged");
  } catch (error) {
    console.error(error);
  }
}