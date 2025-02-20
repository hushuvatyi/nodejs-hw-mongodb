import { ContactsCollection } from '../db/models/contact.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAllContacts = async ({
  page,
  perPage,
  sortOrder,
  sortBy,
  filters,
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  console.log(filters);

  const contactsQuery = ContactsCollection.find({ userId: filters.userId });
  // const contactsQuery = ContactsCollection.find();
  if (filters.contactType) {
    contactsQuery.where('contactType').equals(filters.contactType);
  }

  if (filters.isFavourite) {
    contactsQuery.where('isFavourite').equals(filters.isFavourite);
  }

  const [contactsCount, contacts] = await Promise.all([
    ContactsCollection.find().merge(contactsQuery).countDocuments(),

    contactsQuery
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .exec(),
  ]);

  const paginationData = calculatePaginationData(contactsCount, perPage, page);

  return {
    data: contacts,
    ...paginationData,
  };
};

export const getContactById = async (contactId, userId) => {
  const contact = await ContactsCollection.findOne({
    _id: contactId,
    userId: userId,
  });
  return contact;
};

export const deleteContact = async (contactId, userId) => {
  const contact = await ContactsCollection.findOneAndDelete({
    _id: contactId,
    userId: userId,
  });
  return contact;
};

export const createContact = async ({ photo, ...payload }, userId) => {
  const contact = await ContactsCollection.create({
    ...payload,
    userId: userId,
    photo: photo,
  });

  return contact;
};

export const updateContact = async (
  contactId,
  userId,
  { photo, ...payload },
  options = {},
) => {
  const rawResult = await ContactsCollection.findOneAndUpdate(
    { _id: contactId, userId: userId },
    { ...payload, ...(photo ? { photo: photo } : {}) },
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    },
  );

  if (!rawResult || !rawResult.value) return null;

  return {
    contact: rawResult.value,
    isNew: Boolean(rawResult?.lastErrorObject?.upserted),
  };
};
