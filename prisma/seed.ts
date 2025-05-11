import { users_role } from "@/generated/prisma";
import { generateSalt, hashPassword } from "@/lib/auth/passwordHasher";
import { nowDatetimeObject } from "@/lib/constants";
import prisma from "@/lib/prisma";
import { SeedUserData } from "@/lib/validators/authSchema";
import { nanoid } from "nanoid";

const usersData: SeedUserData[] = [
  {
    name: "Sam Munyi",
    phone: "254700000000",
    national_id: "12345678",
    branch_id: 1,
    email: "samunyi90@gmail.com",
    password: "test123",
    role: users_role.SUPER_ADMIN,
  },
  {
    name: "John Doe",
    phone: "254700000001",
    national_id: "12345679",
    branch_id: 1,
    email: "john@mail.com",
    password: "test123",
    role: users_role.ADMIN,
  },
  {
    name: "Jane Doe",
    phone: "254700000002",
    national_id: "12345680",
    branch_id: 1,
    email: "jane@mail.com",
    password: "test123",
    role: users_role.AGENT,
  },
  {
    name: "Sam Munyi2",
    phone: "254700000003",
    national_id: "12345681",
    branch_id: 1,
    email: "samunyi92@gmail.com",
    password: "test123",
    role: users_role.SUPER_ADMIN,
  },
  {
    name: "John Doe2",
    phone: "254700000004",
    national_id: "12345682",
    branch_id: 1,
    email: "john2@mail.com",
    password: "test123",
    role: users_role.ADMIN,
  },
  {
    name: "Jane Doe2",
    phone: "254700000005",
    national_id: "12345683",
    branch_id: 1,
    email: "jane2@mail.com",
    password: "test123",
    role: users_role.AGENT,
  },
];


type BranchData = {
  public_id: string;
  name: string;
  location: string;
  created_at: Date;
}

const branchData: BranchData[] = [
  {
    name: "HQ",
    location: "Nairobi",
    created_at: nowDatetimeObject(),
    public_id: nanoid(),
  }
]

async function main(usersData: SeedUserData[]) {

  // create branhces 
  await Promise.all(
    branchData.map(async (branch) => {
      const { name, location, public_id } = branch;

      const existingBranch = await prisma.branches.findUnique({
        where: { name },
      });


      if (existingBranch) {
        console.log(`Branch ${name} already exists, status: ${existingBranch.status}`);
        return;
      }

      await prisma.branches.create({
        data: {
          name,
          location,
          created_at: nowDatetimeObject()
        },
      });
    })
  );



  // create users
  await Promise.all(

    usersData.map(async (userData) => {
      const { name, email, password, role } = userData;

      const existingUser = await prisma.users.findUnique({
        where: { email },
      });

      if (existingUser) {
        console.log(`User ${name} already exists, status: ${existingUser.status}`);
        return;
      }

      const salt = generateSalt();
      const hashedPassword = await hashPassword(password, salt);

      await prisma.users.create({
        data: {
          name,
          email,
          password: hashedPassword,
          salt,
          role,
          public_id: nanoid(),
          created_at: nowDatetimeObject()
        },
      });
    })
  );
}

main(usersData)
  .then(() => {
    console.log("Seed completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
