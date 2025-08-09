import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: "Validation error",
        details: error.details.map((detail) => detail.message),
      });
    }

    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query);

    if (error) {
      return res.status(400).json({
        error: "Query validation error",
        details: error.details.map((detail) => detail.message),
      });
    }

    next();
  };
};

// Common validation schemas
export const schemas = {
  advertisement: Joi.object({
    trade_type: Joi.string().valid("BUY", "SELL").required(),
    asset: Joi.string().valid("BTC", "USDT").required(),
    currency: Joi.string().valid("USD", "EUR", "NGN", "GHS").required(),
    payment_method: Joi.string()
      .valid("BANK_TRANSFER", "MOBILE_MONEY", "WIRE_TRANSFER", "CASH")
      .required(),
    rate: Joi.number().positive().required(),
    min_limit: Joi.number().positive().required(),
    max_limit: Joi.number().positive().required(),
    terms: Joi.string().optional(),
  }),

  trade: Joi.object({
    advertisement_id: Joi.string().uuid().required(),
    amount: Joi.number().positive().required(),
  }),

  swap: Joi.object({
    from_asset: Joi.string().valid("BTC", "USDT").required(),
    to_asset: Joi.string().valid("BTC", "USDT").required(),
    from_amount: Joi.number().positive().required(),
  }),

  message: Joi.object({
    content: Joi.string().min(1).max(1000).required(),
    message_type: Joi.string().valid("TEXT", "IMAGE", "FILE").default("TEXT"),
  }),

  userProfile: Joi.object({
    first_name: Joi.string().min(1).max(50).optional(),
    last_name: Joi.string().min(1).max(50).optional(),
    username: Joi.string().min(3).max(30).optional(),
    phone_number: Joi.string().optional(),
  }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),

  advertisementFilters: Joi.object({
    trade_type: Joi.string().valid("BUY", "SELL").optional(),
    asset: Joi.string().valid("BTC", "USDT").optional(),
    currency: Joi.string().valid("USD", "EUR", "NGN", "GHS").optional(),
    payment_method: Joi.string()
      .valid("BANK_TRANSFER", "MOBILE_MONEY", "WIRE_TRANSFER", "CASH")
      .optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};
