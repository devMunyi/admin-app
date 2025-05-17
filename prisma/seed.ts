import { users_role } from "@/generated/prisma";
import { nowDatetimeObject } from "@/lib/constants";
import prisma from "@/lib/prisma";
import { SeedUserData } from "@/lib/validators/authSchema";
import { nanoid } from "nanoid";
import { hashPassword } from "@/lib/auth/password";

const usersData: SeedUserData[] = [
  {
    name: "Samuel Munyi",
    phone: "254712300000",
    national_id: "12345678",
    branch_id: 1,
    email: "samunyi90@gmail.com",
    password: "defaultPass",
    role: users_role.SUPER_ADMIN,
  },
  {
    name: "Kevin Otieno",
    phone: "254712300001",
    national_id: "23456781",
    branch_id: 1,
    email: "kevin.otieno@example.com",
    password: "defaultPass",
    role: users_role.ADMIN,
  },
  {
    name: "Aisha Mohammed",
    phone: "254712300002",
    national_id: "23456782",
    branch_id: 1,
    email: "aisha.mohammed@example.com",
    password: "defaultPass",
    role: users_role.AGENT,
  },
  {
    name: "Brian Kiptoo",
    phone: "254712300003",
    national_id: "23456783",
    branch_id: 1,
    email: "brian.kiptoo@example.com",
    password: "defaultPass",
    role: users_role.SUPER_ADMIN,
  },
  {
    name: "Mercy Wanjiku",
    phone: "254712300004",
    national_id: "23456784",
    branch_id: 1,
    email: "mercy.wanjiku@example.com",
    password: "defaultPass",
    role: users_role.ADMIN,
  },
  {
    name: "David Njoroge",
    phone: "254712300005",
    national_id: "23456785",
    branch_id: 1,
    email: "david.njoroge@example.com",
    password: "defaultPass",
    role: users_role.AGENT,
  },
];


type BranchData = {
  name: string;
  location: string;
  created_at: Date;
}

const branchData: BranchData[] = [
  {
    name: "HQ",
    location: "Nairobi",
    created_at: nowDatetimeObject(),
  }
]

async function main(usersData: SeedUserData[]) {
  // create branches 
  await Promise.all(
    branchData.map(async (branch) => {
      const { name, location } = branch;

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

      const hashedPassword = await hashPassword(password)
      await prisma.users.create({
        data: {
          name,
          email,
          phone: userData.phone,
          national_id: userData.national_id,
          password: hashedPassword,
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