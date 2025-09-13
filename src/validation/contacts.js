import Joi from 'joi';
import { CONTACT_TYPES } from '../constants/index.js';
import { isValidObjectId } from 'mongoose';

export const createContactSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  phoneNumber: Joi.number().integer().required(),
  email: Joi.string().email(),
  contactType: Joi.string()
    .valid(...CONTACT_TYPES)
    .required(),
  isFavourite: Joi.boolean(),
  userId: Joi.string().custom((value, helper) => {
    if (value && !isValidObjectId(value)) {
      return helper.message('User id should be a valid mongo id');
    }
    return true;
  }),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(30),
  phoneNumber: Joi.number().integer(),
  email: Joi.string().email(),
  contactType: Joi.string().valid(...CONTACT_TYPES),
  isFavourite: Joi.boolean(),
});
