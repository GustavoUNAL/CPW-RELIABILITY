import type { OperacionPack } from "./types";
import pack from "./data/operacionPack.json";

export function loadOperacionPack(): OperacionPack {
  return pack as OperacionPack;
}
