import type { Handler } from "express";
import { UserUnauthorised } from "~/util/standardResponses.js";

export const isCamera: Handler = (req, res, next) => {
    if (!req.user!.getCamera()) return UserUnauthorised(res);
    else return next();
};
