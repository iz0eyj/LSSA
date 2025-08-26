"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GarageS3Client = void 0;
exports.getS3Client = getS3Client;
const client_s3_1 = require("@aws-sdk/client-s3");
class GarageS3Client {
    s3Client;
    config;
    constructor() {
        this.config = {
            endpoint: process.env.GARAGE_S3_ENDPOINT || 'http://localhost:3900',
            accessKeyId: process.env.GARAGE_S3_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.GARAGE_S3_SECRET_ACCESS_KEY || '',
            region: process.env.GARAGE_S3_REGION || 'garage'
        };
        this.s3Client = new client_s3_1.S3Client({
            endpoint: this.config.endpoint,
            region: this.config.region,
            credentials: {
                accessKeyId: this.config.accessKeyId,
                secretAccessKey: this.config.secretAccessKey
            },
            forcePathStyle: true,
            logger: console
        });
        console.log('🔧 S3 Client configurato:', {
            endpoint: this.config.endpoint,
            region: this.config.region,
            accessKeyId: this.config.accessKeyId ? `${this.config.accessKeyId.substring(0, 8)}...` : 'NON_CONFIGURATO'
        });
    }
    formatError(error) {
        console.error('❌ S3 Error:', error);
        return {
            code: error.name || 'S3_ERROR',
            message: error.message || 'Errore S3 sconosciuto',
            details: error
        };
    }
    async listObjects(bucketName, prefix, maxKeys) {
        try {
            console.log('📋 Listing objects:', { bucketName, prefix, maxKeys });
            const command = new client_s3_1.ListObjectsV2Command({
                Bucket: bucketName,
                Prefix: prefix,
                MaxKeys: maxKeys || 1000
            });
            const response = await this.s3Client.send(command);
            const objects = (response.Contents || []).map(obj => {
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
            const result = {
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
        }
        catch (error) {
            console.error('❌ Error listing objects:', error);
            return {
                success: false,
                error: this.formatError(error).message
            };
        }
    }
    async uploadObject(bucketName, request) {
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
            const command = new client_s3_1.PutObjectCommand({
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
            const result = {
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
        }
        catch (error) {
            const err = error;
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
    async deleteObject(bucketName, objectKey) {
        try {
            console.log('🗑️ Deleting object:', { bucketName, objectKey });
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: bucketName,
                Key: objectKey
            });
            await this.s3Client.send(command);
            const result = {
                deleted: true,
                key: objectKey
            };
            console.log('✅ Object deleted successfully:', { key: objectKey });
            return {
                success: true,
                data: result,
                message: 'File eliminato con successo'
            };
        }
        catch (error) {
            const err = error;
            console.error('❌ Error deleting object:', err);
            return {
                success: false,
                error: this.formatError(err).message
            };
        }
    }
    async downloadObject(bucketName, objectKey) {
        try {
            console.log('📥 Downloading object:', { bucketName, objectKey });
            const command = new client_s3_1.GetObjectCommand({
                Bucket: bucketName,
                Key: objectKey
            });
            const response = await this.s3Client.send(command);
            if (!response.Body) {
                throw new Error('Nessun contenuto ricevuto dal server');
            }
            const chunks = [];
            const stream = response.Body;
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
            };
        }
        catch (error) {
            const err = error;
            console.error('❌ Error downloading object:', err);
            return {
                success: false,
                error: this.formatError(err).message
            };
        }
    }
    async putBucketWebsite(bucketName, config) {
        try {
            console.log('🌐 PUT BUCKET WEBSITE - Configurazione sito web:', { bucketName, config });
            const command = new client_s3_1.PutBucketWebsiteCommand({
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
        }
        catch (error) {
            const err = error;
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
    async deleteBucketWebsite(bucketName) {
        try {
            console.log('🌐 DELETE BUCKET WEBSITE - Rimozione configurazione sito web:', { bucketName });
            const command = new client_s3_1.DeleteBucketWebsiteCommand({
                Bucket: bucketName
            });
            const response = await this.s3Client.send(command);
            console.log('✅ DELETE BUCKET WEBSITE - Configurazione sito web rimossa con successo:', { bucketName });
            return {
                success: true,
                data: response,
                message: 'Configurazione sito web rimossa con successo'
            };
        }
        catch (error) {
            const err = error;
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
    async putBucketCors(bucketName, config) {
        try {
            console.log('🔗 PUT BUCKET CORS - Configurazione CORS:', { bucketName, config });
            const command = new client_s3_1.PutBucketCorsCommand({
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
        }
        catch (error) {
            const err = error;
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
    async deleteBucketCors(bucketName) {
        try {
            console.log('🔗 DELETE BUCKET CORS - Rimozione configurazione CORS:', { bucketName });
            const command = new client_s3_1.DeleteBucketCorsCommand({
                Bucket: bucketName
            });
            const response = await this.s3Client.send(command);
            console.log('✅ DELETE BUCKET CORS - Configurazione CORS rimossa con successo:', { bucketName });
            return {
                success: true,
                data: response,
                message: 'Configurazione CORS rimossa con successo'
            };
        }
        catch (error) {
            const err = error;
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
    async getObjectUrl(bucketName, objectKey) {
        return `${this.config.endpoint}/${bucketName}/${objectKey}`;
    }
}
exports.GarageS3Client = GarageS3Client;
let s3Client = null;
function getS3Client() {
    if (!s3Client) {
        s3Client = new GarageS3Client();
    }
    return s3Client;
}
//# sourceMappingURL=s3Client.js.map