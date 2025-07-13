"use server";

import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";

export async function isSignupEnabled(): Promise<boolean> {
  return process.env.ENABLE_SIGNUP === "true";
}

export async function getOrGenerateAvatar(
  userId: string,
  userName: string,
): Promise<string> {
  try {
    // First, get the current user from database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      // User not found, return generated avatar
      return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(userName)}`;
    }

    const dbUser = user[0]!;

    // If user already has an image, return it
    if (dbUser.image) {
      return dbUser.image;
    }

    // Generate new avatar URL
    const generatedAvatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(userName)}`;

    // Save the generated avatar to database
    await db
      .update(users)
      .set({ image: generatedAvatar })
      .where(eq(users.id, userId));

    return generatedAvatar;
  } catch (error) {
    console.error("Error getting/generating avatar:", error);
    // Fallback to generated avatar if database fails
    return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(userName)}`;
  }
}
