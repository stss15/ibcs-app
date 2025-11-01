import { ensureDemoTeacher } from "./instant.js";
import { hashPassword } from "./hash.js";

let seeded = false;

export async function runBootstrap() {
  if (seeded) return false;
  seeded = true;
  return ensureDemoTeacher(hashPassword);
}
