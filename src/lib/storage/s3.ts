/**
 * S3 Object Storage Utility
 * Wraps coze-coding-dev-sdk S3Storage for AI output persistence
 */
import { S3Storage } from 'coze-coding-dev-sdk';

let storageInstance: S3Storage | null = null;

export function getS3Storage(): S3Storage {
  if (!storageInstance) {
    storageInstance = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      accessKey: '',
      secretKey: '',
      bucketName: process.env.COZE_BUCKET_NAME,
      region: 'cn-beijing',
    });
  }
  return storageInstance;
}

/**
 * Upload a text/markdown content as file to S3
 */
export async function uploadTextContent(
  content: string,
  fileName: string,
  contentType: string = 'text/markdown; charset=utf-8'
): Promise<string> {
  const storage = getS3Storage();
  const key = await storage.uploadFile({
    fileContent: Buffer.from(content, 'utf-8'),
    fileName,
    contentType,
  });
  return key;
}

/**
 * Upload a Buffer to S3
 */
export async function uploadBuffer(
  buffer: Buffer,
  fileName: string,
  contentType: string = 'application/octet-stream'
): Promise<string> {
  const storage = getS3Storage();
  const key = await storage.uploadFile({
    fileContent: buffer,
    fileName,
    contentType,
  });
  return key;
}

/**
 * Transfer a temporary URL to S3 (for AI-generated images/videos)
 */
export async function transferFromUrl(
  url: string,
  timeout: number = 30000
): Promise<string> {
  const storage = getS3Storage();
  const key = await storage.uploadFromUrl({ url, timeout });
  return key;
}

/**
 * Generate a presigned URL for accessing a stored file
 */
export async function getFileUrl(key: string, expireTime: number = 86400): Promise<string> {
  const storage = getS3Storage();
  const url = await storage.generatePresignedUrl({ key, expireTime });
  return url;
}

/**
 * Read a file from S3
 */
export async function readFile(key: string): Promise<Buffer> {
  const storage = getS3Storage();
  const data = await storage.readFile({ fileKey: key });
  return data;
}

/**
 * Delete a file from S3
 */
export async function deleteFile(key: string): Promise<boolean> {
  const storage = getS3Storage();
  return storage.deleteFile({ fileKey: key });
}

/**
 * Generate a structured S3 key for AI outputs
 * Pattern: ai-outputs/{agentType}/{date}/{fileName}
 */
export function generateStorageKey(agentType: string, fileName: string): string {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `ai-outputs/${agentType}/${date}/${fileName}`;
}
