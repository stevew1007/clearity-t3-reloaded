"use client";

import { useEffect, useState } from "react";

interface EveCharacter {
  id: number;
  characterId: number;
  characterName: string;
  corporationName: string | null;
  allianceName: string | null;
  portraitUrl: string | null;
  createdAt: string;
}

export function EveCharacterManager() {
  const [characters, setCharacters] = useState<EveCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);

  const fetchCharacters = async () => {
    try {
      const response = await fetch("/api/eve/characters");
      if (response.ok) {
        const data = (await response.json()) as { characters: EveCharacter[] };
        setCharacters(data.characters);
      }
    } catch (error) {
      console.error("Failed to fetch characters:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkCharacter = () => {
    setLinking(true);
    window.location.href = "/api/eve/link";
  };

  const handleUnlinkCharacter = async (characterId: number) => {
    try {
      const response = await fetch("/api/eve/characters", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ characterId }),
      });

      if (response.ok) {
        void fetchCharacters();
      }
    } catch (error) {
      console.error("Failed to unlink character:", error);
    }
  };

  useEffect(() => {
    void fetchCharacters();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold">Your EVE Characters</h2>
        <button
          onClick={handleLinkCharacter}
          disabled={linking}
          className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
        >
          {linking ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Linking...
            </>
          ) : (
            <>
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Link EVE Character
            </>
          )}
        </button>
      </div>

      {characters.length === 0 ? (
        <div className="rounded-xl bg-white/10 p-8 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-semibold">
            No EVE Characters Linked
          </h3>
          <p className="mb-4 text-gray-300">
            Link your EVE Online characters to start managing your corporation
            data.
          </p>
          <button
            onClick={handleLinkCharacter}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            Link Your First EVE Character
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {characters.map((character) => (
            <div
              key={character.characterId}
              className="rounded-xl bg-white/10 p-6 transition hover:bg-white/20"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {character.portraitUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={character.portraitUrl}
                      alt={character.characterName}
                      className="h-12 w-12 rounded-full bg-gray-700"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">
                      {character.characterName}
                    </h3>
                    <p className="text-sm text-gray-300">
                      Character ID: {character.characterId}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleUnlinkCharacter(character.characterId)}
                  className="rounded-lg bg-red-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-red-700"
                >
                  Unlink
                </button>
              </div>

              <div className="space-y-2">
                {character.corporationName && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg
                      className="h-4 w-4 text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-300">Corp:</span>
                    <span>{character.corporationName}</span>
                  </div>
                )}

                {character.allianceName && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg
                      className="h-4 w-4 text-purple-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-300">Alliance:</span>
                    <span>{character.allianceName}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    Linked {new Date(character.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
