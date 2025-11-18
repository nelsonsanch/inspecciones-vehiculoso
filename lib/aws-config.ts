
import { S3Client } from "@aws-sdk/client-s3";

export function getBucketConfig() {
  return {
    bucketName: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
    folderPrefix: process.env.NEXT_PUBLIC_S3_FOLDER_PREFIX || "",
  };
}

export function createS3Client() {
  // Usar variables personalizadas para evitar conflictos con variables reservadas de Netlify
  const region = process.env.NEXT_PUBLIC_S3_REGION || "us-west-2";
  
  return new S3Client({
    region: region,
  });
}
