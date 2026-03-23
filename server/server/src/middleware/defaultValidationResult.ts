import type { Handler } from "express";
import { validationResult } from "express-validator";
import { MalformedRequest } from "../util/standardResponses.js";

export const defaultValidationResult: Handler = (req, res, next) => {
    let issues = validationResult(req);
    if (!issues.isEmpty()) {
        return MalformedRequest(res, issues);
    }

    next();
};
