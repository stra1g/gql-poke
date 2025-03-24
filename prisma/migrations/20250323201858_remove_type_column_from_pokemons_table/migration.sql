/*
  Warnings:

  - You are about to drop the column `type` on the `pokemons` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
ALTER TABLE "pokemons" DROP COLUMN "type";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
