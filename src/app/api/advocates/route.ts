import db from "../../../db";
import { asc, eq, ilike, or, inArray, count } from 'drizzle-orm';
import { type NextRequest } from 'next/server'
import { advocates, advocateSpecialties, specialties } from "../../../db/schema";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const searchTerm = searchParams.get('searchTerm') || null;
  const page = parseInt(searchParams.get('page') || "1");

  const resultsPerPage = 20;
  const offset = (page - 1) * resultsPerPage;
  let data, filteredAdvocates;

  // Build query for advocates filtered based on search term and pagination
  if (searchTerm) {
    const advocatesWithMatchingSpecialties = db.select({ advocateId: advocateSpecialties.advocateId })
      .from(advocateSpecialties)
      .leftJoin(specialties, eq(advocateSpecialties.specialtyId, specialties.id))
      .where(ilike(specialties.specialtyName, `%${searchTerm}%`));
    
    filteredAdvocates = db.select()
      .from(advocates)
      .where(
          or(
            ilike(advocates.firstName, `%${searchTerm}%`),
            ilike(advocates.lastName, `%${searchTerm}%`),
            ilike(advocates.city, `%${searchTerm}%`),
            ilike(advocates.degree, `%${searchTerm}%`),
            inArray(advocates.id, advocatesWithMatchingSpecialties)
          )
      )
  } else {
    console.log("No search term provided, fetching all advocates");
    filteredAdvocates = db.select()
      .from(advocates)
  }
  const totalResults = await db.select({ count: count() }).from(filteredAdvocates.as('countedAdvocates'));
  filteredAdvocates = filteredAdvocates
      .orderBy(asc(advocates.id))
      .limit(resultsPerPage)
      .offset(offset);
  
  // Join with specialties to get all specialties for each advocate
  data = await db.select()
    .from(filteredAdvocates.as('filteredAdvocates'))
    .leftJoin(advocateSpecialties, eq(advocateSpecialties.advocateId, filteredAdvocates.as('filteredAdvocates').id))
    .leftJoin(specialties, eq(specialties.id, advocateSpecialties.specialtyId));

  // Transform the flat data into nested structure
  const advocateMap: { [key: number]: any } = {};
  data.forEach(row => {
    if (!advocateMap[row.filteredAdvocates.id]) {
      advocateMap[row.filteredAdvocates.id] = {
        ...row.filteredAdvocates,
        specialties: [],
      };
    }
    if (row.specialties) {
      advocateMap[row.filteredAdvocates.id].specialties.push(row.specialties);
    }
  });
  const result = Object.values(advocateMap);

  // Return paginated results along with total count and total pages
  return Response.json({
    data: result,
    totalResults: totalResults[0].count,
    page: page,
    pageSize: resultsPerPage,
    totalPages: Math.ceil(totalResults[0].count/resultsPerPage),
  });
}
