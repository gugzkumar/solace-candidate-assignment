"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { formatPhoneNumber } from "./utilities";
import { advocates, specialties } from "../db/schema";
import SearchBar from "../components/SearchBar";
import PaginationBar from "../components/PaginationBar";

// Infer the Specialty adn Advocate type from the database schema
type Specialty = typeof specialties.$inferSelect;
type AdvocateInfered = typeof advocates.$inferSelect;
type Advocate = AdvocateInfered & { specialties: Specialty[] };


export default function Home() {
  // Get searchTerm from URL query parameters
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('searchTerm') || "";
  const page = parseInt(searchParams.get('page') || "1");
  const [totalPages, setTotalPages] = useState(0); // Placeholder total pages, replace with actual value from API
  const [advocates, setAdvocates] = useState<Advocate[]>([]);

  // Fetch all advocates when component searchTerm changes
  useEffect(() => {
    console.log("fetching advocates...");
    fetch("/api/advocates" + '?'+ new URLSearchParams({ searchTerm, page: page.toString() })).then((response) => {
      response.json().then((jsonResponse) => {
        setAdvocates(jsonResponse.data);
        setTotalPages(jsonResponse.totalPages);
      });
    });
  }, [searchTerm, page]);

  // Handle search action from SearchBar component
  const onSearch = (newSearchTerm: string) => {
    const params = new URLSearchParams(searchParams);
    if (newSearchTerm === searchTerm) {
      return;
    } else if (newSearchTerm === "") {
      params.delete('searchTerm');
      params.delete('page');
      router.push(pathname);
    } else {
      params.set('searchTerm', newSearchTerm);
      params.delete('page');
      router.push(pathname + '?' + params.toString());
    }
  };

  // Handle page change action from PaginationBar component
  const onPageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    if (newPage === page) {
      return;
    } else if (newPage === 1) {
      params.delete('page');
      router.push(pathname + '?' + params.toString());
    } else {
      params.set('page', newPage.toString());
      router.push(pathname + '?' + params.toString());
    }
  }

  return (
    <main style={{ margin: "24px" }}>
      <h1 className="mb-4 text-4xl font-extrabold text-gray-900 md:text-5xl lg:text-6xl">Solace Advocates</h1>
      <div>
        <SearchBar placeholder="Search Advocates..." defaultValue={searchTerm} onClickSearch={onSearch} />
        {
          searchTerm === "" ? <></> :
          <>
            <br/>
            Results for "<span id="search-term" className="font-semibold">{searchTerm}</span>"
          </>
        }
      </div>
      <br />
      {/* Table styling from https://www.hyperui.dev/components/application/tables */}
      <div className="overflow-x-auto rounded border border-gray-300 shadow-sm">
        <table className="min-w-full divide-y-2 divide-gray-200">
          <thead className="">
            <tr className="*:font-medium *:text-gray-900 *:px-3 *:py-2 *:whitespace-nowrap *:text-left">
              <th>First Name</th>
              <th>Last Name</th>
              <th>City</th>
              <th>Degree</th>
              <th>Specialties</th>
              <th>YoE</th>
              <th>Phone Number</th>
            </tr>
          </thead>
          <tbody>
            {advocates.map((advocate, index) => {
              return (
                <tr key={index} className="odd:bg-white even:bg-gray-100 border-b border-gray-200 *:px-3 *:py-2 *:whitespace-nowrap">
                  <td>{advocate.firstName}</td>
                  <td>{advocate.lastName}</td>
                  <td>{advocate.city}</td>
                  <td>{advocate.degree}</td>
                  <td>
                    <ul className="max-w-md space-y-1 list-disc list-inside">
                      {advocate.specialties.map((s, index) => (
                        <li key={index}>{s.specialtyName}</li>
                      ))}
                    </ul>
                  </td>
                  <td>{advocate.yearsOfExperience}</td>
                  <td>
                    <a className="text-blue-600 hover:underline" href={`tel:${advocate.phoneNumber}`}>
                      {formatPhoneNumber(advocate.phoneNumber)}
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <br/ >
      <PaginationBar currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
    </main>
  );
}
