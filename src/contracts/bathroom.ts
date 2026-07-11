import { toJSONSchema } from "zod";
import { BathroomSchema } from "../types/bathroom.js";

export const BathroomJsonSchema = toJSONSchema(BathroomSchema);
