import db from "../../../db";
import { advocates } from "../../../db/schema";
import { NextRequest } from "next/server";
import { asc, and, ilike, or, count, sql } from 'drizzle-orm';

const PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const search_query = searchParams.get('search_query') || null;
  const page = parseInt(searchParams.get('page') || "1");
  const offset = (page - 1) * PAGE_SIZE;

  const search_terms: string[] = search_query ? search_query.trim().split(" ").map(s => `%${s}%`) : [];

  const whereFilters = and(...search_terms.map(term => or(
    ilike(advocates.firstName, `${term}`),
    ilike(advocates.lastName, `${term}`),
    ilike(advocates.city, `${term}`),
    ilike(advocates.degree, `${term}`),
    sql`${advocates.specialties}::text ILIKE ${term}`
  )));

  const selectedAdvocates = db.select()
    .from(advocates)
    .where(search_query ? or(whereFilters) :undefined)
    .orderBy(asc(advocates.id));

  const totalResults = (await db.select({ count: count() }).from(selectedAdvocates.as('countedAdvocates')))[0].count;

  const selectedAdvocatesForPage = selectedAdvocates
    .limit(PAGE_SIZE)
    .offset(offset);
  const data = await selectedAdvocatesForPage;


  return Response.json({
    data,
    totalResults: totalResults,
    page: page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(totalResults / PAGE_SIZE)
  });
  
}
