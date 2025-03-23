/*
  Warnings:

  - You are about to drop the column `type` on the `pokemons` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_pokemons" (
    "name" TEXT NOT NULL,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_pokemons" ("created_at", "id", "name") SELECT "created_at", "id", "name" FROM "pokemons";
DROP TABLE "pokemons";
ALTER TABLE "new_pokemons" RENAME TO "pokemons";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
