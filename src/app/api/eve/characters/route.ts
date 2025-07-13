import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { eveCharacters, accounts } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const characters = await db
      .select({
        id: eveCharacters.id,
        characterId: eveCharacters.characterId,
        characterName: eveCharacters.characterName,
        corporationName: eveCharacters.corporationName,
        allianceName: eveCharacters.allianceName,
        portraitUrl: eveCharacters.portraitUrl,
        createdAt: eveCharacters.createdAt,
      })
      .from(eveCharacters)
      .where(eq(eveCharacters.userId, session.user.id));

    return NextResponse.json({ characters });
  } catch (error) {
    console.error("Failed to fetch EVE characters:", error);
    return NextResponse.json({ error: "Failed to fetch characters" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { characterId } = await request.json() as { characterId: number };
    const characterIdStr = characterId.toString();

    // Delete from both tables - eve_characters and accounts
    await db.transaction(async (tx) => {
      // Delete EVE character data
      await tx
        .delete(eveCharacters)
        .where(
          and(
            eq(eveCharacters.characterId, characterId),
            eq(eveCharacters.userId, session.user.id)
          )
        );

      // Delete OAuth account data
      await tx
        .delete(accounts)
        .where(
          and(
            eq(accounts.provider, "eveonline"),
            eq(accounts.providerAccountId, characterIdStr),
            eq(accounts.userId, session.user.id)
          )
        );
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to unlink EVE character:", error);
    return NextResponse.json({ error: "Failed to unlink character" }, { status: 500 });
  }
}