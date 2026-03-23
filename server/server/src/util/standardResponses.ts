import type { Response } from "express";
import type { Result, ValidationError } from "express-validator";

export const ActionSuccessful = (res: Response) => res.status(200).json({ code: 200, message: "Action carried out successfully." });
export const MalformedRequest = (res: Response, issues?: Result<ValidationError>) => res.status(400).json(issues ? { code: 400, message: "Invalid parameters/request body.", issues } : { code: 400, message: "Invalid parameters/request body." });
export const UserUnauthenticated = (res: Response) => res.status(401).json({ code: 401, message: "User is not logged in/using a valid API key." });
export const UserUnauthorised = (res: Response) => res.status(403).json({ code: 403, message: "You are not authorised to carry out this action." });
export const ResourceNotFound = (res: Response) => res.status(404).json({ code: 404, message: "The requested resource cannot be found." });
export const ServerError = (res: Response, message?: string) => res.status(500).json({ code: 500, message: message || "Internal server error." });
