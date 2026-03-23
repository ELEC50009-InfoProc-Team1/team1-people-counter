import bcrypt from "bcrypt";

export const hash = (key: string, rounds: number = 10) => {
    return bcrypt.hashSync(key, rounds);
};
