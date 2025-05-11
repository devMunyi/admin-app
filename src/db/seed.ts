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
    },
    {
        name: "John Doe",
        email: "john@mail.com",
        password: "test123",
        role: UserRoles.ADMIN,
    },
    {
        name: "Jane Doe",
        email: "jane@mail.com",
        password: "test123",
        role: UserRoles.AGENT,
    },
    {
        name: "Sam Munyi2",
        email: "samunyi92@gmail.com",
        password: "test123",
        role: UserRoles.SUPER_ADMIN,
    },
    {
        name: "John Doe2",
        email: "john2@mail.com",
        password: "test123",
        role: UserRoles.ADMIN,
    },
    {
        name: "Jane Doe2",
        email: "jane2@mail.com",
        password: "test123",
        role: UserRoles.AGENT,
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