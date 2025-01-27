"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = runMigrations;
function runMigrations(db) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check if image_path column exists
        const tableInfo = yield db.all("PRAGMA table_info(code_generations)");
        const imagePathColumnExists = tableInfo.some((column) => column.name === "image_path");
        if (!imagePathColumnExists) {
            // Add image_path column if it doesn't exist
            yield db.exec(`
      ALTER TABLE code_generations ADD COLUMN image_path TEXT;
    `);
            console.log("Added image_path column to code_generations table");
        }
    });
}
