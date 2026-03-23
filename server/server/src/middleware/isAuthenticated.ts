import type { Handler } from "express";
import { UserUnauthenticated } from "~/util/standardResponses.js";

export const isAuthenticated: Handler = (req, res, next) => {
    if (!req.user) return UserUnauthenticated(res);
    else return next();
};
