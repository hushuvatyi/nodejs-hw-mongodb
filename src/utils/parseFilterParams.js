import { CONTACT_TYPES } from '../constants/index.js';

const parseContactType = (value) => {
  const isString = typeof value === 'string';
  if (!isString) return;
  const isContactType = (contactType) => CONTACT_TYPES.includes(contactType);

  if (isContactType(value)) return value;
};

const parseBoolean = (value) => {
  const isString = typeof value === 'string';
  if (!isString) return;

  const isBoolean = (bool) => ['false', 'true'].includes(bool);
  if (isBoolean(value)) return value;
};

export const parseFilterParams = (query) => {
  const { type, isFavorite } = query;

  const parsedContactType = parseContactType(type);
  const parsedIsFavorite = parseBoolean(isFavorite);

  return {
    contactType: parsedContactType,
    isFavorite: parsedIsFavorite,
  };
};
