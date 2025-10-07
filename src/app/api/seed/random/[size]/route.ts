import db from "../../../../../db";

import { advocates } from "../../../../../db/schema";
import { getMultipleRandomAdvocates } from "../../../../../db/seed/advocates";
import { NextRequest } from "next/server";

const MAX_SEED_SIZE = 1000;

export async function POST(
    request: NextRequest,
    { params }: { params: { size: number } }
) {
    const { size } = await params;
    if (size < 1 || size > MAX_SEED_SIZE) {
        return Response.json({ error: `Size must be a number between 1 and ${MAX_SEED_SIZE}` }, { status: 400 });
    }
    const advocatesToInsert = getMultipleRandomAdvocates(Number(size));
    console.log(`Seeding ${advocatesToInsert.length} advocates...`);
    const advocatesRecords = await db.insert(advocates).values(advocatesToInsert).returning();
    console.log(`Inserted ${advocatesRecords.length} advocates`);
    return Response.json({ advocates: advocatesRecords });
}
