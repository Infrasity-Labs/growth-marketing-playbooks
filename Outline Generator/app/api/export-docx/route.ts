import { NextRequest, NextResponse } from "next/server";
import { convertToDocx } from "@/service/convert-to-docx";
import {contextStack} from "@/service/contextStack";

export async function POST(req: NextRequest) {
  const userId = req.headers.get("user_id") as string;
  try {
    contextStack.push({ User: { Id: userId } });
    const { data } = await req.json();
  
    const buffer = await convertToDocx(data);
    
    contextStack.pop();
    return NextResponse.json({
      message: "Document created",
      buffer: Array.from(buffer),
    });
  } catch (error) {
    console.error({userId: contextStack.peek()?.User.Id});
    contextStack.pop();
    return NextResponse.json({ error: "Internal server error" }, {status: 500});
  }
}