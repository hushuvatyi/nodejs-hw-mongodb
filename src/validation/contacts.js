import Joi from 'joi';
import { CONTACT_TYPES } from '../constants/index.js';

export const createContactSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  phoneNumber: Joi.number().integer().required(),
  email: Joi.string().email(),
  contactType: Joi.string()
    .valid(...CONTACT_TYPES)
    .required(),
  isFavourite: Joi.boolean(),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(30),
  phoneNumber: Joi.number().integer(),
  email: Joi.string().email(),
  contactType: Joi.string().valid(...CONTACT_TYPES),
  isFavourite: Joi.boolean(),
});
