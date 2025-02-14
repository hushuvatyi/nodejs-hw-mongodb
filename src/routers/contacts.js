import { Router } from 'express';
import {
  deleteContactController,
  getAllContactsController,
  getContactByIdController,
  createContatController,
  updateContactController,
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  createContactSchema,
  updateContactSchema,
} from '../validation/contacts.js';
import { isValidId } from '../middlewares/isValidId.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.use('/', authenticate);

router.get('/', ctrlWrapper(getAllContactsController));
router.get('/:contactId', isValidId, ctrlWrapper(getContactByIdController));
router.delete('/:contactId', isValidId, ctrlWrapper(deleteContactController));
router.post(
  '/',
  validateBody(createContactSchema),
  ctrlWrapper(createContatController),
);
router.patch(
  '/:contactId',
  isValidId,
  validateBody(updateContactSchema),
  ctrlWrapper(updateContactController),
);

export default router;
