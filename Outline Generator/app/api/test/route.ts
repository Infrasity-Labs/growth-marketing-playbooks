import { NextResponse, NextRequest } from "next/server";
import {contextStack} from "@/service/contextStack";

export async function GET(req: NextRequest){
  const userId = req.headers.get("user_id") as string;
  contextStack.push({ User: { Id: userId } });
  console.log(contextStack.peek()?.User.Id);
  contextStack.pop();
  return NextResponse.json({message: 'Hello World!'});
}