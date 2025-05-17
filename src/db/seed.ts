import { generateSalt, hashPassword } from "@/lib/auth/passwordHasher";
import { SeedUserData } from "@/lib/validators/authSchema";
import { UserRoles } from "./enums";
import db from "@/db"
import { users } from "@/db/schema";
import { getTodayDateTime } from "@/lib/utils";


const usersData: SeedUserData[] = [
    {
        name: "Sam Munyi",
        email: "samunyi90@gmail.com",
        password: "test123",
        role: UserRoles.SUPER_ADMIN,
        national_id: "12345678",
        phone: "0700000001",
        branch_id: 1,
    },
    {
        name: "John Doe",
        email: "john@mail.com",
        password: "test123",
        role: UserRoles.ADMIN,
        national_id: "23456789",
        phone: "0700000002",
        branch_id: 1,
    },
    {
        name: "Jane Doe",
        email: "jane@mail.com",
        password: "test123",
        role: UserRoles.AGENT,
        national_id: "34567890",
        phone: "0700000003",
        branch_id: 2,
    },
    {
        name: "Sam Munyi2",
        email: "samunyi92@gmail.com",
        password: "test123",
        role: UserRoles.SUPER_ADMIN,
        national_id: "45678901",
        phone: "0700000004",
        branch_id: 2,
    },
    {
        name: "John Doe2",
        email: "john2@mail.com",
        password: "test123",
        role: UserRoles.ADMIN,
        national_id: "56789012",
        phone: "0700000005",
        branch_id: 3,
    },
    {
        name: "Jane Doe2",
        email: "jane2@mail.com",
        password: "test123",
        role: UserRoles.AGENT,
        national_id: "67890123",
        phone: "0700000006",
        branch_id: 3,
    },
];


async function main(usersData: SeedUserData[]) {
    await Promise.all(
        usersData.map(async (userData) => {
            const { name, email, password, role } = userData;

            // Check if user exists
            const existingUser = await db.query.users.findFirst({
                where: (users, { eq }) => eq(users.email, email),
            });

            if (existingUser) return;

            // Hash password
            const salt = generateSalt();
            const hashedPassword = await hashPassword(password, salt);

            // Insert user
            await db.insert(users).values({
                name,
                email,
                password: hashedPassword,
                salt,
                role,
                createdAt: getTodayDateTime()
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