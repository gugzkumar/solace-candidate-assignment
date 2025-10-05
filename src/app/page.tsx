"use client";

import { useEffect, useState } from "react";
import { formatPhoneNumber } from "./utilities";
import { advocates } from "../db/schema";

// Infer the Advocate type from the database schema
type AdvocateInfered = typeof advocates.$inferSelect;
// Redefine Advocate type to have specialties as string array since jsonb is not inferred correctly
type Advocate = Omit<AdvocateInfered, 'specialties' > & { specialties: string[] };


export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);

  useEffect(() => {
    console.log("fetching advocates...");
    fetch("/api/advocates").then((response) => {
      response.json().then((jsonResponse) => {
        setAdvocates(jsonResponse.data);
        setFilteredAdvocates(jsonResponse.data);
      });
    });
  }, []);

  const onChange = (e) => {
    const searchTerm = e.target.value;

    document.getElementById("search-term").innerHTML = searchTerm;

    console.log("filtering advocates...");
    const filteredAdvocates: Advocate[] = advocates.filter((advocate: Advocate) => {
      return (
        advocate.firstName.includes(searchTerm) ||
        advocate.lastName.includes(searchTerm) ||
        advocate.city.includes(searchTerm) ||
        advocate.degree.includes(searchTerm) ||
        advocate.specialties.includes(searchTerm) ||
        advocate.yearsOfExperience.toString().includes(searchTerm) ||
        formatPhoneNumber(advocate.phoneNumber).includes(searchTerm)
      );
    });

    setFilteredAdvocates(filteredAdvocates);
  };

  const onClick = () => {
    console.log(advocates);
    setFilteredAdvocates(advocates);
  };

  return (
    <main style={{ margin: "24px" }}>
      <h1>Solace Advocates</h1>
      <br />
      <br />
      <div>
        <p>Search</p>
        <p>
          Searching for: <span id="search-term"></span>
        </p>
        <input style={{ border: "1px solid black" }} onChange={onChange} />
        <button onClick={onClick}>Reset Search</button>
      </div>
      <br />
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
            {filteredAdvocates.map((advocate, index) => {
              return (
                <tr key={index} className="odd:bg-white even:bg-gray-100 border-b border-gray-200 *:px-3 *:py-2 *:whitespace-nowrap">
                  <td>{advocate.firstName}</td>
                  <td>{advocate.lastName}</td>
                  <td>{advocate.city}</td>
                  <td>{advocate.degree}</td>
                  <td>
                    <ul className="max-w-md space-y-1 list-disc list-inside">
                      {advocate.specialties.map((s, index) => (
                        <li key={index}>{s}</li>
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
    </main>
  );
}
