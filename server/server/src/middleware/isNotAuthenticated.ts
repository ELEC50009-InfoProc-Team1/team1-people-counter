import type { Handler } from "express";
import { UserUnauthorised } from "~/util/standardResponses.js";

export const isNotAuthenticated: Handler = (req, res, next) => {
    if (req.user) return UserUnauthorised(res);
    else return next();
};
