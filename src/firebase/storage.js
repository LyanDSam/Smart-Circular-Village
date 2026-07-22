// Firebase Storage Service Placeholder
import { getStorage } from 'firebase/storage';
import { app } from './config';

export const storage = getStorage(app);

// Storage helper placeholders (to be implemented in future sprints)
export const uploadFilePlaceholder = async (filePath, file) => {
  console.log(`Upload placeholder for file: ${filePath}`);
  return 'https://via.placeholder.com/150';
};
