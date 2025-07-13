import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  // Check if signup is enabled
  if (process.env.ENABLE_SIGNUP !== "true") {
    return NextResponse.json(
      { error: "User registration is currently disabled" },
      { status: 403 },
    );
  }

  try {
    const body = (await req.json()) as {
      name: string;
      email: string;
      password: string;
    };
    const { name, email, password } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 },
      );
    }

    // Hash password before storing
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user with hashed password
    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        emailVerified: null,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
      });

    const createdUser = newUser[0];
    if (!createdUser) {
      throw new Error("Failed to create user");
    }

    return NextResponse.json(
      { message: "User created successfully", user: createdUser },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
