import Joi from 'joi';

export const registerUserValidationSchema = Joi.object({
  name: Joi.string().required().min(2).max(25),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6).max(15),
});

export const loginUserValidationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6).max(15),
});
