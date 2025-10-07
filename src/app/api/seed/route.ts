import db from "../../../db";
import { type NextRequest } from 'next/server'
import { advocates, specialties, advocateSpecialties } from "../../../db/schema";
import { advocateData, specialtiesData } from "../../../db/seed/advocates";
import { faker } from '@faker-js/faker';

const pickRandomItems = (arr: any[], min: number, max: number) => {
  const numItems = Math.floor(Math.random() * (max - min + 1)) + min;
  arr.sort(() => 0.5 - Math.random());
  return arr.slice(0, numItems);
};

async function seedSpecialties() {
  console.log("Seeding specialties...");
  return db.insert(specialties).values(specialtiesData).returning();
}

async function seedWithPredefinedAdvocates(speciatlyIds: number[]) {
  console.log("Seeding advocates from ../db/seed/advocates with random specialties...");
  const advocatesRecords = await db.insert(advocates).values(advocateData).returning();
  const advocateSpecialtyRecords: {advocateId: number, specialtyId: number}[] = [];
  advocatesRecords.forEach((record) => {
    pickRandomItems(speciatlyIds, 1, 8).forEach((specialtyId) => {
      advocateSpecialtyRecords.push({
        advocateId: record.id,
        specialtyId: specialtyId,
      });
    });
  });
  await db.insert(advocateSpecialties).values(advocateSpecialtyRecords)
  console.log("Inserted specialties for advocates");
  return advocatesRecords;
}


export function createRandomAdvocate() {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    city: faker.location.city(),
    degree: faker.helpers.arrayElement(["MD", "PhD", "MSW"]),
    yearsOfExperience: faker.number.int({ min: 1, max: 40 }),
    phoneNumber: parseInt(faker.string.numeric({ length: 9, exclude: ['0'] })),
  };
}

async function seedWithRandomAdvocates(speciatlyIds: number[], numAdvocates: number) {
  console.log(`Seeding ${numAdvocates} random advocates with random specialties...`);
  const advocatesToCreate = faker.helpers.multiple(createRandomAdvocate, {
    count: numAdvocates,
  });
  const advocatesRecords = await db.insert(advocates).values(advocatesToCreate).returning();
  const advocateRecordIds = advocatesRecords.map(record => record.id);
  // const createRandomAdvocateSpecialtyRecords: {advocateId: number, specialtyId: number}[] = () =>{
  //   return {
  //     advocateId: faker.helpers.arrayElement(advocateRecordIds),
  //     specialtyId: faker.helpers.arrayElement(speciatlyIds),
  //   }
  // };
  const advocateSpecialtyRecords: {advocateId: number, specialtyId: number}[] = [];
  advocateRecordIds.forEach((advocateId) => {
    faker.helpers.arrayElements(speciatlyIds, { min: 1, max: 8 }).forEach((specialtyId) => {
      advocateSpecialtyRecords.push({
        advocateId: advocateId,
        specialtyId: specialtyId,
      });
    });
  });
  await db.insert(advocateSpecialties).values(advocateSpecialtyRecords)
  return advocatesRecords;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const randomSeed: boolean = searchParams.get('randomSeed') === 'true' || false;
  const numAdvocates = parseInt(searchParams.get('numAdvocates') || "100");
  const skipSpecialtySeed: boolean = searchParams.get('skipSpecialtySeed') === 'true' || false;
  const deleteAll: boolean = searchParams.get('deleteAll') === 'true' || false;

  console.log("Seeding database...");
  console.log(searchParams);
  if (deleteAll) {
    console.log("Deleting all records from advocate_specialties, advocates, and specialties tables...");
    await db.delete(advocateSpecialties);
    await db.delete(advocates);
    await db.delete(specialties);
  }

  if (!skipSpecialtySeed) {
    await seedSpecialties();
  }

  const specialityResults = await db.select().from(specialties);
  const speciatlyIds: number[] = specialityResults.map(record => record.id);

  if (!randomSeed) {
    await seedWithPredefinedAdvocates(speciatlyIds);
  } else {
    const MAX_INSERT_SIZE = 5000;
    const batches = Math.ceil(numAdvocates / MAX_INSERT_SIZE);
    for (let i = 0; i < batches; i++) {
      const batchSize = (i === batches - 1) ? (numAdvocates - i * MAX_INSERT_SIZE) : MAX_INSERT_SIZE;
      console.log(`Seeding batch ${i + 1} of ${batches} with ${batchSize} advocates...`);
      await seedWithRandomAdvocates(speciatlyIds, batchSize);
    }
  }
  return Response.json({ message: "Database seeded successfully" });
}
