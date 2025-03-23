-- CreateTable
CREATE TABLE "types" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "pokemon_types" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pokemon_id" INTEGER NOT NULL,
    "type_id" INTEGER NOT NULL,
    CONSTRAINT "pokemon_types_pokemon_id_fkey" FOREIGN KEY ("pokemon_id") REFERENCES "pokemons" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "pokemon_types_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "types" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "types_name_key" ON "types"("name");
