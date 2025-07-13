import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { eveCharacters, accounts } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { env } from "~/env";

export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code) {
    const authUrl = new URL("https://login.eveonline.com/v2/oauth/authorize");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("redirect_uri", `${request.nextUrl.origin}/api/eve/link`);
    authUrl.searchParams.set("client_id", env.EVE_CLIENT_ID);
    authUrl.searchParams.set("scope", "esi-characters.read_characters.v1 esi-corporations.read_corporation_membership.v1 esi-wallet.read_character_wallet.v1 esi-markets.read_character_orders.v1");
    authUrl.searchParams.set("state", session.user.id);

    return NextResponse.redirect(authUrl);
  }

  if (state !== session.user.id) {
    return NextResponse.json({ error: "Invalid state parameter" }, { status: 400 });
  }

  try {
    const tokenResponse = await fetch("https://login.eveonline.com/v2/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${env.EVE_CLIENT_ID}:${env.EVE_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${request.nextUrl.origin}/api/eve/link`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const tokenData = await tokenResponse.json() as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      token_type: string;
    };

    const verifyResponse = await fetch("https://esi.evetech.net/verify/", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!verifyResponse.ok) {
      throw new Error("Failed to verify token");
    }

    const characterData = await verifyResponse.json() as {
      CharacterID: number;
      CharacterName: string;
      ExpiresOn: string;
      Scopes: string;
      TokenType: string;
      CharacterOwnerHash: string;
      IntellectualProperty: string;
    };

    const characterInfoResponse = await fetch(
      `https://esi.evetech.net/latest/characters/${characterData.CharacterID}/`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    let corporationName = null;
    let allianceId = null;
    let allianceName = null;

    if (characterInfoResponse.ok) {
      const characterInfo = await characterInfoResponse.json() as {
        corporation_id: number;
        alliance_id?: number;
      };

      const corpResponse = await fetch(
        `https://esi.evetech.net/latest/corporations/${characterInfo.corporation_id}/`
      );
      if (corpResponse.ok) {
        const corpData = await corpResponse.json() as { name: string; alliance_id?: number };
        corporationName = corpData.name;
        
        if (corpData.alliance_id) {
          allianceId = corpData.alliance_id;
          const allianceResponse = await fetch(
            `https://esi.evetech.net/latest/alliances/${corpData.alliance_id}/`
          );
          if (allianceResponse.ok) {
            const allianceData = await allianceResponse.json() as { name: string };
            allianceName = allianceData.name;
          }
        }
      }
    }

    const expiresAt = Math.floor(Date.now() / 1000) + tokenData.expires_in;
    const characterIdStr = characterData.CharacterID.toString();

    // Save OAuth data to accounts table (NextAuth standard)
    await db.insert(accounts).values({
      userId: session.user.id,
      type: "oauth",
      provider: "eveonline",
      providerAccountId: characterIdStr,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt,
      token_type: tokenData.token_type,
      scope: characterData.Scopes,
    }).onConflictDoUpdate({
      target: [accounts.provider, accounts.providerAccountId],
      set: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt,
        scope: characterData.Scopes,
      },
    });

    // Save EVE-specific data to eve_characters table
    await db.insert(eveCharacters).values({
      characterId: characterData.CharacterID,
      characterName: characterData.CharacterName,
      corporationId: characterInfoResponse.ok ? (await characterInfoResponse.json()).corporation_id : null,
      corporationName,
      allianceId,
      allianceName,
      portraitUrl: `https://images.evetech.net/characters/${characterData.CharacterID}/portrait?size=128`,
      provider: "eveonline",
      providerAccountId: characterIdStr,
      userId: session.user.id,
    }).onConflictDoUpdate({
      target: eveCharacters.characterId,
      set: {
        characterName: characterData.CharacterName,
        corporationName,
        allianceId,
        allianceName,
        portraitUrl: `https://images.evetech.net/characters/${characterData.CharacterID}/portrait?size=128`,
        updatedAt: new Date(),
      },
    });

    return NextResponse.redirect(`${request.nextUrl.origin}?linked=${characterData.CharacterName}`);
  } catch (error) {
    console.error("EVE character linking error:", error);
    return NextResponse.json({ error: "Failed to link EVE character" }, { status: 500 });
  }
}