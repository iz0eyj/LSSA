import { 
  S3Client, 
  ListObjectsV2Command, 
  PutObjectCommand, 
  DeleteObjectCommand, 
  GetObjectCommand,
  PutBucketWebsiteCommand,
  DeleteBucketWebsiteCommand,
  PutBucketCorsCommand,
  DeleteBucketCorsCommand
} from '@aws-sdk/client-s3';
import { 
  ListObjectsResponse,
  UploadObjectRequest,
  UploadObjectResponse,
  DeleteObjectResponse,
  ApiResponse,
  ApiError,
  S3Object
} from '../types';

export class GarageS3Client {
  private s3Client: S3Client;
  private config: {
    endpoint: string;
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  };

  constructor() {
    this.config = {
      endpoint: process.env.GARAGE_S3_ENDPOINT || 'http://localhost:3900',
      accessKeyId: process.env.GARAGE_S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.GARAGE_S3_SECRET_ACCESS_KEY || '',
      region: process.env.GARAGE_S3_REGION || 'garage'
    };

    this.s3Client = new S3Client({
      endpoint: this.config.endpoint,
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey
      },
      forcePathStyle: true, // Necessario per Garage
      logger: console
    });

    console.log('🔧 S3 Client configurato:', {
      endpoint: this.config.endpoint,
      region: this.config.region,
      accessKeyId: this.config.accessKeyId ? `${this.config.accessKeyId.substring(0, 8)}...` : 'NON_CONFIGURATO'
    });
  }

  private formatError(error: any): ApiError {
    console.error('❌ S3 Error:', error);
    return {
      code: error.name || 'S3_ERROR',
      message: error.message || 'Errore S3 sconosciuto',
      details: error
    };
  }

  async listObjects(bucketName: string, prefix?: string, maxKeys?: number): Promise<ApiResponse<ListObjectsResponse>> {
    try {
      console.log('📋 Listing objects:', { bucketName, prefix, maxKeys });
      
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys || 1000
      });

      const response = await this.s3Client.send(command);
      
      const objects: S3Object[] = (response.Contents || []).map(obj => {
        const lastModifiedDate = obj.LastModified?.toISOString() || '';
        console.log('📅 Object date mapping:', {
          key: obj.Key,
          originalDate: obj.LastModified,
          isoString: lastModifiedDate
        });
        
        return {
          key: obj.Key || '',
          last_modified: lastModifiedDate,
          size: obj.Size || 0,
          etag: obj.ETag || '',
          storageClass: obj.StorageClass || 'STANDARD'
        };
      });

      const result: ListObjectsResponse = {
        contents: objects,
        is_truncated: response.IsTruncated || false,
        next_continuation_token: response.NextContinuationToken,
        name: bucketName,
        max_keys: response.MaxKeys || 1000,
        prefix: response.Prefix || ''
      };

      console.log('✅ Objects listed successfully:', {
        count: objects.length,
        isTruncated: result.is_truncated
      });

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('❌ Error listing objects:', error);
      return {
        success: false,
        error: this.formatError(error as any).message
      };
    }
  }

  async uploadObject(bucketName: string, request: UploadObjectRequest): Promise<ApiResponse<UploadObjectResponse>> {
    try {
      console.log('📤 S3 UPLOAD DEBUG - Inizio upload:', {
        bucketName,
        key: request.key,
        contentType: request.contentType,
        size: request.file.length,
        endpoint: this.config.endpoint,
        region: this.config.region,
        accessKeyId: this.config.accessKeyId ? `${this.config.accessKeyId.substring(0, 8)}...` : 'NON_CONFIGURATO'
      });

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: request.key,
        Body: request.file,
        ContentType: request.contentType || 'application/octet-stream',
        Metadata: request.metadata || {}
      });

      console.log('🔧 S3 UPLOAD DEBUG - Comando PutObject creato:', {
        Bucket: bucketName,
        Key: request.key,
        ContentType: request.contentType || 'application/octet-stream',
        MetadataKeys: Object.keys(request.metadata || {})
      });

      console.log('🚀 S3 UPLOAD DEBUG - Invio comando al server S3...');
      const response = await this.s3Client.send(command);
      console.log('📨 S3 UPLOAD DEBUG - Risposta ricevuta:', {
        ETag: response.ETag,
        VersionId: response.VersionId,
        ServerSideEncryption: response.ServerSideEncryption
      });

      const result: UploadObjectResponse = {
        key: request.key,
        etag: response.ETag || '',
        size: request.file.length,
        location: `${this.config.endpoint}/${bucketName}/${request.key}`
      };

      console.log('✅ S3 UPLOAD DEBUG - Upload completato con successo:', {
        key: request.key,
        etag: result.etag,
        location: result.location
      });

      return {
        success: true,
        data: result,
        message: 'File caricato con successo'
      };
    } catch (error) {
      const err = error as any;
      console.error('❌ S3 UPLOAD DEBUG - Errore dettagliato:', {
        errorName: err.name,
        errorMessage: err.message,
        errorCode: err.Code,
        statusCode: err.$metadata?.httpStatusCode,
        requestId: err.$metadata?.requestId,
        bucketName,
        key: request.key,
        endpoint: this.config.endpoint
      });
      console.error('❌ S3 UPLOAD DEBUG - Stack trace completo:', err.stack);
      console.error('❌ S3 UPLOAD DEBUG - Oggetto errore completo:', JSON.stringify(err, null, 2));
      
      return {
        success: false,
        error: this.formatError(error).message
      };
    }
  }

  async deleteObject(bucketName: string, objectKey: string): Promise<ApiResponse<DeleteObjectResponse>> {
    try {
      console.log('🗑️ Deleting object:', { bucketName, objectKey });

      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: objectKey
      });

      await this.s3Client.send(command);

      const result: DeleteObjectResponse = {
        deleted: true,
        key: objectKey
      };

      console.log('✅ Object deleted successfully:', { key: objectKey });

      return {
        success: true,
        data: result,
        message: 'File eliminato con successo'
      };
    } catch (error) {
      const err = error as any;
      console.error('❌ Error deleting object:', err);
      return {
        success: false,
        error: this.formatError(err).message
      };
    }
  }

  async downloadObject(bucketName: string, objectKey: string): Promise<ApiResponse<Buffer>> {
    try {
      console.log('📥 Downloading object:', { bucketName, objectKey });

      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey
      });

      const response = await this.s3Client.send(command);
      
      if (!response.Body) {
        throw new Error('Nessun contenuto ricevuto dal server');
      }

      // Converti il stream in buffer
      const chunks: Uint8Array[] = [];
      const stream = response.Body as any;
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      
      const buffer = Buffer.concat(chunks);

      console.log('✅ Object downloaded successfully:', {
        key: objectKey,
        size: buffer.length,
        contentType: response.ContentType
      });

      return {
        success: true,
        data: buffer,
        message: `File scaricato con successo (${buffer.length} bytes)`
      } as any;
    } catch (error) {
      const err = error as any;
      console.error('❌ Error downloading object:', err);
      return {
        success: false,
        error: this.formatError(err).message
      };
    }
  }

  async putBucketWebsite(bucketName: string, config: {
    indexDocument: string;
    errorDocument?: string;
  }): Promise<ApiResponse<any>> {
    try {
      console.log('🌐 PUT BUCKET WEBSITE - Configurazione sito web:', { bucketName, config });
      
      const command = new PutBucketWebsiteCommand({
        Bucket: bucketName,
        WebsiteConfiguration: {
          IndexDocument: {
            Suffix: config.indexDocument
          },
          ErrorDocument: config.errorDocument ? {
            Key: config.errorDocument
          } : undefined
        }
      });
      
      const response = await this.s3Client.send(command);
      
      console.log('✅ PUT BUCKET WEBSITE - Sito web configurato con successo:', {
        bucketName,
        indexDocument: config.indexDocument,
        errorDocument: config.errorDocument
      });
      
      return {
        success: true,
        data: response,
        message: 'Configurazione sito web applicata con successo'
      };
    } catch (error) {
      const err = error as any;
      console.error('❌ PUT BUCKET WEBSITE - Errore:', {
        bucketName,
        config,
        error: err.message
      });
      
      return {
        success: false,
        error: this.formatError(err).message
      };
    }
  }

  async deleteBucketWebsite(bucketName: string): Promise<ApiResponse<any>> {
    try {
      console.log('🌐 DELETE BUCKET WEBSITE - Rimozione configurazione sito web:', { bucketName });
      
      const command = new DeleteBucketWebsiteCommand({
        Bucket: bucketName
      });
      
      const response = await this.s3Client.send(command);
      
      console.log('✅ DELETE BUCKET WEBSITE - Configurazione sito web rimossa con successo:', { bucketName });
      
      return {
        success: true,
        data: response,
        message: 'Configurazione sito web rimossa con successo'
      };
    } catch (error) {
      const err = error as any;
      console.error('❌ DELETE BUCKET WEBSITE - Errore:', {
        bucketName,
        error: err.message
      });
      
      return {
        success: false,
        error: this.formatError(err).message
      };
    }
  }

  async putBucketCors(bucketName: string, config: {
    origins: string[];
    methods: string[];
    headers: string[];
  }): Promise<ApiResponse<any>> {
    try {
      console.log('🔗 PUT BUCKET CORS - Configurazione CORS:', { bucketName, config });
      
      const command = new PutBucketCorsCommand({
        Bucket: bucketName,
        CORSConfiguration: {
          CORSRules: [{
            AllowedOrigins: config.origins,
            AllowedMethods: config.methods,
            AllowedHeaders: config.headers,
            MaxAgeSeconds: 3600
          }]
        }
      });
      
      const response = await this.s3Client.send(command);
      
      console.log('✅ PUT BUCKET CORS - CORS configurato con successo:', {
        bucketName,
        origins: config.origins,
        methods: config.methods,
        headers: config.headers
      });
      
      return {
        success: true,
        data: response,
        message: 'Configurazione CORS applicata con successo'
      };
    } catch (error) {
      const err = error as any;
      console.error('❌ PUT BUCKET CORS - Errore:', {
        bucketName,
        config,
        error: err.message
      });
      
      return {
        success: false,
        error: this.formatError(err).message
      };
    }
  }

  async deleteBucketCors(bucketName: string): Promise<ApiResponse<any>> {
    try {
      console.log('🔗 DELETE BUCKET CORS - Rimozione configurazione CORS:', { bucketName });
      
      const command = new DeleteBucketCorsCommand({
        Bucket: bucketName
      });
      
      const response = await this.s3Client.send(command);
      
      console.log('✅ DELETE BUCKET CORS - Configurazione CORS rimossa con successo:', { bucketName });
      
      return {
        success: true,
        data: response,
        message: 'Configurazione CORS rimossa con successo'
      };
    } catch (error) {
      const err = error as any;
      console.error('❌ DELETE BUCKET CORS - Errore:', {
        bucketName,
        error: err.message
      });
      
      return {
        success: false,
        error: this.formatError(err).message
      };
    }
  }

  async getObjectUrl(bucketName: string, objectKey: string): Promise<string> {
    return `${this.config.endpoint}/${bucketName}/${objectKey}`;
  }
}

// Singleton instance
let s3Client: GarageS3Client | null = null;

export function getS3Client(): GarageS3Client {
  if (!s3Client) {
    s3Client = new GarageS3Client();
  }
  return s3Client;
}