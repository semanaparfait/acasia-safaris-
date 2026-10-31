import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { Readable } from 'stream';

// The Neon Storage buckets this app may use (create them in Neon Console > Storage)
export const BUCKETS = ['tourpackages', 'destinations', 'gallery', 'workers'];

// Talks to Neon Object Storage. It is S3-compatible, so we use the AWS S3 SDK.
// The buckets are private: images are served to the website by FilesController
// at  <PUBLIC_API_URL>/api/files/<bucket>/<key>
@Injectable()
export class StorageService {
  private client: S3Client | null = null;

  constructor(private config: ConfigService) {
    const accessKeyId = config.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = config.get<string>('AWS_SECRET_ACCESS_KEY');
    const endpoint = config.get<string>('AWS_ENDPOINT_URL_S3');

    // Without credentials the API still runs; only uploads are disabled.
    if (accessKeyId && secretAccessKey && endpoint) {
      this.client = new S3Client({
        region: config.get<string>('AWS_REGION') ?? 'us-east-2',
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
        forcePathStyle: true, // Neon only supports path-style URLs
        requestChecksumCalculation: 'WHEN_REQUIRED',
      });
    }
  }

  // Saves a file and returns the public URL to store in the database
  upload(bucket: string, file: Express.Multer.File) {
    return this.save(
      bucket,
      file.buffer,
      extname(file.originalname).toLowerCase(),
      file.mimetype,
    );
  }

  // Saves a file made by the server, e.g. a quotation PDF
  async save(
    bucket: string,
    body: Buffer,
    extension: string,
    contentType: string,
  ) {
    const client = this.getClient();
    this.checkBucket(bucket);

    // Unique name so files never overwrite each other, e.g. "3f2a...c9.jpg"
    const key = `${randomUUID()}${extension}`;

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );

    return { bucket, key, url: this.publicUrl(bucket, key) };
  }

  // Reads a file (used to show images on the website)
  async download(bucket: string, key: string) {
    const client = this.getClient();
    this.checkBucket(bucket);

    try {
      const result = await client.send(
        new GetObjectCommand({ Bucket: bucket, Key: key }),
      );
      return {
        stream: result.Body as Readable,
        contentType: result.ContentType ?? 'application/octet-stream',
      };
    } catch {
      throw new NotFoundException(`File ${bucket}/${key} not found`);
    }
  }

  // Deletes a file if the URL points to our storage (other URLs are ignored).
  // Works whatever the address in front is (localhost, Render, ...):
  // only the ".../api/files/<bucket>/<key>" part matters.
  async deleteByUrl(url: string | null | undefined) {
    const match = url?.match(/\/api\/files\/([^/]+)\/([^/?#]+)/);
    if (!this.client || !match) return;

    const [, bucket, key] = match;
    if (!BUCKETS.includes(bucket)) return;

    await this.client.send(
      new DeleteObjectCommand({ Bucket: bucket, Key: key }),
    );
  }

  private publicUrl(bucket: string, key: string) {
    const base =
      this.config.get<string>('PUBLIC_API_URL') ?? 'http://localhost:4000';
    return `${base}/api/files/${bucket}/${key}`;
  }

  private checkBucket(bucket: string) {
    if (!BUCKETS.includes(bucket)) {
      throw new BadRequestException(
        `Unknown bucket "${bucket}". Use one of: ${BUCKETS.join(', ')}`,
      );
    }
  }

  private getClient() {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'Storage is not configured: add the AWS_* values from Neon Storage to backend/.env',
      );
    }
    return this.client;
  }
}
