import db from "../../../db";
import { advocates } from "../../../db/schema";
import { NextResponse } from "next/server";

export async function GET(request: NextResponse) {
  const data = await db.select().from(advocates);
  return Response.json({ data });
}
