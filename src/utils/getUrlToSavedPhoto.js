import { getEnvVar } from './getEnvVar.js';
import { saveFileToUploadDir } from './saveFileToUploadDir.js';
import { saveFileToCloudinary } from './saveFileToCloudinary.js';

export const getUrlToSavedPhoto = async (photo) => {
  let photoUrl;

  if (photo) {
    if (getEnvVar('ENABLE_CLOUDINARY') === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }
  return photoUrl;
};
