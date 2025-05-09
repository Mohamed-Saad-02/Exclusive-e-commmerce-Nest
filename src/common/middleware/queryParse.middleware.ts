import { NextFunction, Response } from "express";
import * as qs from "qs";

export const RequestQueryParse = (req, res: Response, next: NextFunction) => {
  req["parsedQuery"] = qs.parse(req.query);
  next();
};
