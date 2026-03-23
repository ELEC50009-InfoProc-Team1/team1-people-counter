import { randomBytes } from "node:crypto";

export const tokenGenerate = (length: number = 48) => {
    return Buffer.from(randomBytes(length)).toString("hex");
};
