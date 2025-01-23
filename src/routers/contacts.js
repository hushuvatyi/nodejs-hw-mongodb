import { Router } from 'express';
import {
  deleteContactController,
  getAllContactsController,
  getContactByIdController,
  createContatController,
  updateContactController,
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();

router.get('/contacts', ctrlWrapper(getAllContactsController));
router.get('/contacts/:contactId', ctrlWrapper(getContactByIdController));
router.delete('/contacts/:contactId', ctrlWrapper(deleteContactController));
router.post('/contacts', ctrlWrapper(createContatController));
router.patch('/contacts/:contactId', ctrlWrapper(updateContactController));

export default router;
