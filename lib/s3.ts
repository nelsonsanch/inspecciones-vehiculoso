
// Firebase Storage implementation
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import app from './firebase';

// Get storage instance (lazy initialization with explicit app)
let storageInstance: ReturnType<typeof getStorage> | null = null;

function getStorageInstance() {
  if (!storageInstance) {
    storageInstance = getStorage(app);
  }
  return storageInstance;
}

export async function uploadFile(buffer: Buffer, fileName: string): Promise<string> {
  const storage = getStorageInstance();
  const timestamp = Date.now();
  const storagePath = `uploads/${timestamp}-${fileName}`;
  const storageRef = ref(storage, storagePath);
  
  // Convert buffer to Blob
  const blob = new Blob([buffer], { type: getContentType(fileName) });
  
  // Upload to Firebase Storage
  await uploadBytes(storageRef, blob, {
    contentType: getContentType(fileName),
  });
  
  // Return the storage path (not the full URL, we'll generate it on demand)
  return storagePath;
}

export async function downloadFile(storagePath: string): Promise<string> {
  const storage = getStorageInstance();
  const storageRef = ref(storage, storagePath);
  
  // Get download URL (valid for a limited time)
  return await getDownloadURL(storageRef);
}

export async function deleteFile(storagePath: string): Promise<void> {
  const storage = getStorageInstance();
  const storageRef = ref(storage, storagePath);
  
  await deleteObject(storageRef);
}

function getContentType(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop();
  const contentTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    pdf: 'application/pdf',
  };
  return contentTypes[ext || ''] || 'application/octet-stream';
}
