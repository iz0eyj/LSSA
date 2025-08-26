import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  GarageConfig, 
  ClusterStatus, 
  Bucket, 
  AccessKey, 
  ListObjectsResponse,
  CreateBucketRequest,
  UpdateBucketRequest,
  CreateAccessKeyRequest,
  UpdateAccessKeyRequest,
  UploadObjectRequest,
  UploadObjectResponse,
  DeleteObjectRequest,
  DeleteObjectResponse,
  ApiResponse,
  ApiError
} from '../types';
import { getS3Client } from './s3Client';

export class GarageClient {
  private client: AxiosInstance;
  private config: GarageConfig;

  constructor(config: GarageConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Authorization': `Bearer ${config.adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    // Interceptor per logging delle richieste
    this.client.interceptors.request.use(
      (config) => {
        console.log('🚀 Garage API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          fullUrl: `${config.baseURL}${config.url}`,
          headers: config.headers,
          data: config.data
        });
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Interceptor per gestire errori
    this.client.interceptors.response.use(
      (response) => {
        console.log('✅ Garage API Response:', {
          status: response.status,
          statusText: response.statusText,
          url: response.config.url,
          data: response.data
        });
        return response;
      },
      (error) => {
        console.error('❌ Garage API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          headers: error.config?.headers,
          data: error.response?.data,
          message: error.message
        });
        throw this.formatError(error);
      }
    );
  }

  private formatError(error: any): ApiError {
    if (error.response) {
      return {
        code: error.response.status.toString(),
        message: error.response.data?.message || error.response.statusText,
        details: error.response.data
      };
    }
    return {
      code: 'NETWORK_ERROR',
      message: error.message || 'Errore di connessione'
    };
  }

  // Test di connessione
  async testConnection(): Promise<ApiResponse<{ status: string }>> {
    try {
      const response = await this.client.get('/v2/GetClusterStatus');
      return {
        success: true,
        data: { status: 'connected' },
        message: 'Connessione a Garage riuscita'
      };
    } catch (error) {
      return {
        success: false,
        error: (error as ApiError).message
      };
    }
  }

  // Gestione cluster
  async getClusterStatus(): Promise<ApiResponse<ClusterStatus>> {
    try {
      const response = await this.client.get('/v2/GetClusterStatus');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: (error as ApiError).message
      };
    }
  }

  async getClusterLayout(): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get('/v2/GetClusterLayout');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: (error as ApiError).message
      };
    }
  }

  // Gestione bucket
  async listBuckets(): Promise<ApiResponse<Bucket[]>> {
    try {
      console.log('🔍 LIST BUCKETS DEBUG - Chiamata API /v2/ListBuckets');
      
      const response = await this.client.get('/v2/ListBuckets');
      
      console.log('📨 LIST BUCKETS DEBUG - Risposta completa dall\'API Garage:', {
        status: response.status,
        statusText: response.statusText,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        bucketCount: Array.isArray(response.data) ? response.data.length : 'N/A',
        rawData: response.data
      });
      
      let transformedData = response.data;
      
      if (Array.isArray(response.data)) {
        console.log('📋 LIST BUCKETS DEBUG - Dettagli bucket ricevuti (prima della trasformazione):');
        response.data.forEach((bucket, index) => {
          console.log(`🪣 Bucket ${index + 1} (raw):`, {
            id: bucket.id,
            globalAliases: bucket.globalAliases,
            localAliases: bucket.localAliases,
            created: bucket.created,
            websiteAccess: bucket.websiteAccess,
            quotas: bucket.quotas,
            corsRules: bucket.corsRules,
            fullBucketObject: bucket
          });
        });
        
        // Trasforma i dati da camelCase a snake_case
        transformedData = response.data.map((bucket: any) => {
          const transformed = {
            id: bucket.id,
            global_aliases: bucket.globalAliases || [],
            local_aliases: bucket.localAliases || [],
            created_at: bucket.created,
            website_access: bucket.websiteAccess || false,
            quotas: bucket.quotas,
            cors_rules: bucket.corsRules
          };
          
          console.log(`🔄 TRANSFORM DEBUG - Bucket ${bucket.id}:`, {
            original: {
              globalAliases: bucket.globalAliases,
              localAliases: bucket.localAliases,
              created: bucket.created,
              websiteAccess: bucket.websiteAccess
            },
            transformed: {
              global_aliases: transformed.global_aliases,
              local_aliases: transformed.local_aliases,
              created_at: transformed.created_at,
              website_access: transformed.website_access
            }
          });
          
          return transformed;
        });
        
        console.log('✅ LIST BUCKETS DEBUG - Dati trasformati:', {
          bucketCount: transformedData.length,
          transformedData: transformedData
        });
      } else {
        console.log('⚠️ LIST BUCKETS DEBUG - Risposta non è un array:', response.data);
      }
      
      return {
        success: true,
        data: transformedData
      };
    } catch (error) {
      console.error('❌ LIST BUCKETS DEBUG - Errore durante la chiamata API:', {
        error: error,
        message: (error as ApiError).message,
        stack: (error as Error).stack
      });
      
      return {
        success: false,
        error: (error as ApiError).message
      };
    }
  }

  async getBucket(bucketId: string): Promise<ApiResponse<Bucket>> {
    try {
      const response = await this.client.get(`/v2/GetBucketInfo?id=${bucketId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: (error as ApiError).message
      };
    }
  }

  async createBucket(request: CreateBucketRequest): Promise<ApiResponse<Bucket>> {
    try {
      console.log('🏗️ CREATE BUCKET - Inizio creazione bucket con opzioni:', {
        globalAlias: request.global_alias,
        localAlias: request.local_alias,
        visibilityOptions: request.visibility_options
      });

      const response = await this.client.post('/v2/CreateBucket', request);
      const bucketData = response.data;
      
      // Se è stato specificato un global_alias, aggiungilo esplicitamente al bucket
      if (request.global_alias && bucketData.id) {
        console.log('🏷️ Adding global alias to new bucket:', { bucketId: bucketData.id, alias: request.global_alias });
        
        try {
          const aliasResult = await this.client.post('/v2/AddBucketAlias', {
            id: bucketData.id,
            global_alias: request.global_alias
          });
          
          if (aliasResult.status === 200) {
            console.log('✅ Global alias added successfully to bucket');
            // Aggiorna i dati del bucket con l'alias
            bucketData.global_aliases = [request.global_alias];
          } else {
            console.warn('⚠️ Failed to add global alias to bucket:', aliasResult.statusText);
          }
        } catch (aliasError) {
          console.warn('⚠️ Error adding global alias to bucket:', aliasError);
          // Non bloccare la creazione del bucket per errori di alias
        }
      }
      
      // Configura automaticamente i permessi S3 per la chiave utilizzata dal backend
      const s3AccessKeyId = process.env.GARAGE_S3_ACCESS_KEY_ID;
      if (s3AccessKeyId && bucketData.id) {
        console.log('🔐 Configurazione permessi S3 per il nuovo bucket:', { bucketId: bucketData.id, keyId: s3AccessKeyId });
        
        try {
          const permissionsResult = await this.allowBucketKey(bucketData.id, s3AccessKeyId, {
            read: true,
            write: true,
            owner: false
          });
          
          if (permissionsResult.success) {
            console.log('✅ Permessi S3 configurati con successo per il nuovo bucket');
          } else {
            console.warn('⚠️ Errore nella configurazione dei permessi S3:', permissionsResult.error);
          }
        } catch (permissionsError) {
          console.warn('⚠️ Errore durante la configurazione dei permessi S3:', permissionsError);
          // Non bloccare la creazione del bucket per errori di permessi
        }
      } else {
        console.warn('⚠️ Chiave S3 non configurata, impossibile impostare i permessi automaticamente');
      }

      // Gestione opzioni di visibilità
      if (request.visibility_options && bucketData.id) {
        console.log('🌐 Configurazione opzioni di visibilità:', request.visibility_options);
        
        try {
          // Prepara le opzioni di aggiornamento del bucket
          const updateOptions: any = {};
          
          // Configura accesso web se richiesto
          if (request.visibility_options.website_access) {
            console.log('🌐 Abilitazione accesso web per bucket:', bucketData.id);
            updateOptions.website_access = true;
          }
          
          // Configura CORS se richiesto
          if (request.visibility_options.cors_enabled) {
            console.log('🔗 Configurazione CORS per bucket:', bucketData.id);
            updateOptions.cors_rules = [
              {
                id: 'default-cors-rule',
                allowed_origins: ['*'],
                allowed_methods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
                allowed_headers: ['*'],
                expose_headers: ['ETag'],
                max_age_seconds: 3600
              }
            ];
          }
          
          // Applica le configurazioni se necessario
          if (Object.keys(updateOptions).length > 0) {
            console.log('🔧 Applicazione configurazioni bucket:', updateOptions);
            
            const updateResult = await this.client.put(`/v2/UpdateBucket?id=${bucketData.id}`, updateOptions);
            
            if (updateResult.status === 200) {
              console.log('✅ Configurazioni di visibilità applicate con successo');
              // Aggiorna i dati del bucket con le nuove configurazioni
              Object.assign(bucketData, updateOptions);
            } else {
              console.warn('⚠️ Errore nell\'applicazione delle configurazioni di visibilità:', updateResult.statusText);
            }
          }
        } catch (visibilityError) {
          console.warn('⚠️ Errore durante la configurazione delle opzioni di visibilità:', visibilityError);
          // Non bloccare la creazione del bucket per errori di configurazione
        }
      }
      
      console.log('✅ Bucket created successfully:', { 
        bucketId: bucketData.id, 
        globalAliases: bucketData.global_aliases,
        websiteAccess: bucketData.website_access,
        corsRules: bucketData.cors_rules?.length || 0
      });
      
      return {
        success: true,
        data: bucketData,
        message: 'Bucket creato con successo'
      };
    } catch (error) {
      console.error('❌ CREATE BUCKET - Errore durante la creazione:', error);
      return {
        success: false,
        error: (error as ApiError).message
      };
    }
  }

  async updateBucket(bucketId: string, request: UpdateBucketRequest): Promise<ApiResponse<Bucket>> {
    try {
      const response = await this.client.put(`/v2/UpdateBucket?id=${bucketId}`, request);
      return {
        success: true,
        data: response.data,
        message: 'Bucket aggiornato con successo'
      };
    } catch (error) {
      return {
        success: false,
        error: (error as ApiError).message
      };
    }
  }

  async deleteBucket(bucketId: string): Promise<ApiResponse<void>> {
    try {
      await this.client.delete(`/v2/DeleteBucket?id=${bucketId}`);
      return {
        success: true,
        message: 'Bucket eliminato con successo'
      };
    } catch (error) {
      return {
        success: false,
        error: (error as ApiError).message
      };
    }
  }

  // Gestione chiavi di accesso
  async listAccessKeys(): Promise<ApiResponse<AccessKey[]>> {
    try {
      const response = await this.client.get('/v2/ListKeys');
      
      console.log('🔑 GarageClient.listAccessKeys - Raw API response:', {
        status: response.status,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        keysCount: Array.isArray(response.data) ? response.data.length : 'N/A',
        keys: response.data
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ GarageClient.listAccessKeys - Error:', error);
      return {
        success: false,
        error: (error as ApiError).message
      };
    }
  }

  async getAccessKey(keyId: string): Promise<ApiResponse<AccessKey>> {
    try {
      const response = await this.client.get(`/v2/GetKeyInfo?id=${keyId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: (error as ApiError).message
      };
    }
  }

  async createAccessKey(request: CreateAccessKeyRequest): Promise<ApiResponse<AccessKey>> {
    try {
      const response = await this.client.post('/v2/CreateKey', request);
      return {
        success: true,
        data: response.data,
        message: 'Chiave di accesso creata con successo'
      };
    } catch (error) {
      return {
        success: false,
        error: (error as ApiError).message
      };
    }
  }

  async updateAccessKey(keyId: string, request: UpdateAccessKeyRequest): Promise<ApiResponse<AccessKey>> {
    try {
      const response = await this.client.put(`/v2/UpdateKey?id=${keyId}`, request);
      return {
        success: true,
        data: response.data,
        message: 'Chiave di accesso aggiornata con successo'
      };
    } catch (error) {
      return {
        success: false,
        error: (error as ApiError).message
      };
    }
  }

  async deleteAccessKey(keyId: string): Promise<ApiResponse<void>> {
    try {
      console.log('🗑️ DELETE KEY DEBUG - Tentativo eliminazione chiave:', { keyId });
      
      const response = await this.client.post(`/v2/DeleteKey?id=${keyId}`);
      
      console.log('✅ DELETE KEY DEBUG - Chiave eliminata con successo:', {
        keyId,
        status: response.status,
        statusText: response.statusText
      });
      
      return {
        success: true,
        message: 'Chiave di accesso eliminata con successo'
      };
    } catch (error) {
      const err = error as any;
      console.error('❌ DELETE KEY DEBUG - Errore eliminazione chiave:', {
        keyId,
        error: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      return {
        success: false,
        error: (error as ApiError).message
      };
    }
  }

  // Gestione permessi bucket
  async allowBucketKey(bucketId: string, accessKeyId: string, permissions: { read?: boolean; write?: boolean; owner?: boolean }): Promise<ApiResponse<any>> {
    try {
      console.log('🔐 ALLOW BUCKET KEY - Configurazione permessi:', { bucketId, accessKeyId, permissions });
      
      const response = await this.client.post('/v2/AllowBucketKey', {
        bucketId,
        accessKeyId,
        permissions
      });
      
      console.log('✅ ALLOW BUCKET KEY - Permessi configurati con successo:', {
        bucketId,
        accessKeyId,
        permissions,
        status: response.status
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Permessi bucket configurati con successo'
      };
    } catch (error) {
      const err = error as any;
      console.error('❌ ALLOW BUCKET KEY - Errore configurazione permessi:', {
        bucketId,
        accessKeyId,
        permissions,
        error: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      return {
        success: false,
        error: (error as ApiError).message
      };
    }
  }

  async denyBucketKey(bucketId: string, accessKeyId: string, permissions: { read?: boolean; write?: boolean; owner?: boolean }): Promise<ApiResponse<any>> {
    try {
      console.log('🚫 DENY BUCKET KEY - Rimozione permessi:', { bucketId, accessKeyId, permissions });
      
      const response = await this.client.post('/v2/DenyBucketKey', {
        bucketId,
        accessKeyId,
        permissions
      });
      
      console.log('✅ DENY BUCKET KEY - Permessi rimossi con successo:', {
        bucketId,
        accessKeyId,
        permissions,
        status: response.status
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Permessi bucket rimossi con successo'
      };
    } catch (error) {
      const err = error as any;
      console.error('❌ DENY BUCKET KEY - Errore rimozione permessi:', {
        bucketId,
        accessKeyId,
        permissions,
        error: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      return {
        success: false,
        error: (error as ApiError).message
      };
    }
  }

  // Gestione oggetti (tramite S3 API)
  async listObjects(bucketName: string, prefix?: string, maxKeys?: number): Promise<ApiResponse<ListObjectsResponse>> {
    try {
      console.log('🔄 GarageClient.listObjects - delegating to S3 client:', { bucketName, prefix, maxKeys });
      
      const s3Client = getS3Client();
      const result = await s3Client.listObjects(bucketName, prefix, maxKeys);
      
      console.log('✅ S3 listObjects result:', { success: result.success, objectCount: result.data?.contents?.length });
      
      return result;
    } catch (error) {
      console.error('❌ Error in GarageClient.listObjects:', error);
      return {
        success: false,
        error: (error as ApiError).message || 'Errore durante il recupero degli oggetti'
      };
    }
  }

  async uploadObject(bucketName: string, request: UploadObjectRequest): Promise<ApiResponse<UploadObjectResponse>> {
    try {
      console.log('🔄 GarageClient.uploadObject - delegating to S3 client:', { bucketName, key: request.key, size: request.file.length });
      
      const s3Client = getS3Client();
      const result = await s3Client.uploadObject(bucketName, request);
      
      console.log('✅ S3 uploadObject result:', { success: result.success, key: request.key });
      
      return result;
    } catch (error) {
      console.error('❌ Error in GarageClient.uploadObject:', error);
      return {
        success: false,
        error: (error as ApiError).message || 'Errore durante il caricamento del file'
      };
    }
  }

  async deleteObject(bucketName: string, objectKey: string): Promise<ApiResponse<DeleteObjectResponse>> {
    try {
      console.log('🔄 GarageClient.deleteObject - delegating to S3 client:', { bucketName, objectKey });
      
      const s3Client = getS3Client();
      const result = await s3Client.deleteObject(bucketName, objectKey);
      
      console.log('✅ S3 deleteObject result:', { success: result.success, key: objectKey });
      
      return result;
    } catch (error) {
      console.error('❌ Error in GarageClient.deleteObject:', error);
      return {
        success: false,
        error: (error as ApiError).message || 'Errore durante l\'eliminazione del file'
      };
    }
  }

  async downloadObject(bucketName: string, objectKey: string): Promise<ApiResponse<Buffer>> {
    try {
      console.log('🔄 GarageClient.downloadObject - delegating to S3 client:', { bucketName, objectKey });
      
      const s3Client = getS3Client();
      const result = await s3Client.downloadObject(bucketName, objectKey);
      
      console.log('✅ S3 downloadObject result:', { 
        success: result.success, 
        key: objectKey,
        size: result.success ? result.data?.length || 0 : 0 
      });
      
      return result;
    } catch (error) {
      console.error('❌ Error in GarageClient.downloadObject:', error);
      return {
        success: false,
        error: (error as ApiError).message || 'Errore durante il download del file'
      };
    }
  }

  // Gestione configurazione bucket avanzata
  async updateBucketWebsite(bucketId: string, config: {
    enabled: boolean;
    indexDocument?: string;
    errorDocument?: string;
  }): Promise<ApiResponse<any>> {
    try {
      console.log('🌐 UPDATE BUCKET WEBSITE - Configurazione sito web:', { bucketId, config });
      
      if (config.enabled) {
        // Abilita il sito web usando l'API S3 PutBucketWebsite
        const s3Client = getS3Client();
        const result = await s3Client.putBucketWebsite(bucketId, {
          indexDocument: config.indexDocument || 'index.html',
          errorDocument: config.errorDocument || 'error.html'
        });
        
        if (result.success) {
          console.log('✅ UPDATE BUCKET WEBSITE - Sito web abilitato con successo');
          return {
            success: true,
            data: result.data,
            message: 'Configurazione sito web abilitata con successo'
          };
        } else {
          throw new Error(result.error || 'Errore nell\'abilitazione del sito web');
        }
      } else {
        // Disabilita il sito web usando l'API S3 DeleteBucketWebsite
        const s3Client = getS3Client();
        const result = await s3Client.deleteBucketWebsite(bucketId);
        
        if (result.success) {
          console.log('✅ UPDATE BUCKET WEBSITE - Sito web disabilitato con successo');
          return {
            success: true,
            data: result.data,
            message: 'Configurazione sito web disabilitata con successo'
          };
        } else {
          throw new Error(result.error || 'Errore nella disabilitazione del sito web');
        }
      }
    } catch (error) {
      const err = error as any;
      console.error('❌ UPDATE BUCKET WEBSITE - Errore:', {
        bucketId,
        config,
        error: err.message,
        stack: err.stack
      });
      
      return {
        success: false,
        error: (error as ApiError).message || 'Errore nell\'aggiornamento della configurazione sito web'
      };
    }
  }

  async updateBucketCors(bucketId: string, config: {
    enabled: boolean;
    origins?: string[];
    methods?: string[];
    headers?: string[];
  }): Promise<ApiResponse<any>> {
    try {
      console.log('🔗 UPDATE BUCKET CORS - Configurazione CORS:', { bucketId, config });
      
      if (config.enabled) {
        // Abilita CORS usando l'API S3 PutBucketCors
        const s3Client = getS3Client();
        const result = await s3Client.putBucketCors(bucketId, {
          origins: config.origins || ['*'],
          methods: config.methods || ['GET', 'POST', 'PUT', 'DELETE'],
          headers: config.headers || ['*']
        });
        
        if (result.success) {
          console.log('✅ UPDATE BUCKET CORS - CORS abilitato con successo');
          return {
            success: true,
            data: result.data,
            message: 'Configurazione CORS abilitata con successo'
          };
        } else {
          throw new Error(result.error || 'Errore nell\'abilitazione di CORS');
        }
      } else {
        // Disabilita CORS usando l'API S3 DeleteBucketCors
        const s3Client = getS3Client();
        const result = await s3Client.deleteBucketCors(bucketId);
        
        if (result.success) {
          console.log('✅ UPDATE BUCKET CORS - CORS disabilitato con successo');
          return {
            success: true,
            data: result.data,
            message: 'Configurazione CORS disabilitata con successo'
          };
        } else {
          throw new Error(result.error || 'Errore nella disabilitazione di CORS');
        }
      }
    } catch (error) {
      const err = error as any;
      console.error('❌ UPDATE BUCKET CORS - Errore:', {
        bucketId,
        config,
        error: err.message,
        stack: err.stack
      });
      
      return {
        success: false,
        error: (error as ApiError).message || 'Errore nell\'aggiornamento della configurazione CORS'
      };
    }
  }

  async addBucketAlias(bucketId: string, alias: string): Promise<ApiResponse<any>> {
    try {
      console.log('➕ ADD BUCKET ALIAS - Aggiunta alias:', { bucketId, alias });
      
      const response = await this.client.post('/v2/PutBucketAlias', {
        id: bucketId,
        alias: alias
      });
      
      console.log('✅ ADD BUCKET ALIAS - Alias aggiunto con successo:', {
        bucketId,
        alias,
        status: response.status
      });
      
      return {
        success: true,
        data: response.data,
        message: `Alias '${alias}' aggiunto con successo al bucket`
      };
    } catch (error) {
      const err = error as any;
      console.error('❌ ADD BUCKET ALIAS - Errore aggiunta alias:', {
        bucketId,
        alias,
        error: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      return {
        success: false,
        error: (error as ApiError).message || `Errore nell'aggiunta dell'alias '${alias}'`
      };
    }
  }

  async removeBucketAlias(bucketId: string, alias: string): Promise<ApiResponse<any>> {
    try {
      console.log('➖ REMOVE BUCKET ALIAS - Rimozione alias:', { bucketId, alias });
      
      const response = await this.client.post('/v2/DeleteBucketAlias', {
        id: bucketId,
        alias: alias
      });
      
      console.log('✅ REMOVE BUCKET ALIAS - Alias rimosso con successo:', {
        bucketId,
        alias,
        status: response.status
      });
      
      return {
        success: true,
        data: response.data,
        message: `Alias '${alias}' rimosso con successo dal bucket`
      };
    } catch (error) {
      const err = error as any;
      console.error('❌ REMOVE BUCKET ALIAS - Errore rimozione alias:', {
        bucketId,
        alias,
        error: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      return {
        success: false,
        error: (error as ApiError).message || `Errore nella rimozione dell'alias '${alias}'`
      };
    }
  }

  // Metriche
  async getMetrics(): Promise<ApiResponse<string>> {
    try {
      const response = await this.client.get('/metrics', {
        headers: {
          'Accept': 'text/plain',
          'Authorization': `Bearer ${this.config.adminToken}`
        }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: (error as ApiError).message
      };
    }
  }

  // Metodi aggiuntivi per statistiche e metriche
  async getClusterStatistics(): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get('/v2/GetClusterStatistics');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: (error as ApiError).message
      };
    }
  }

  async getClusterHealth(): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get('/v2/GetClusterHealth');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: (error as ApiError).message
      };
    }
  }
}

// Singleton instance
let garageClient: GarageClient | null = null;

export function getGarageClient(): GarageClient {
  if (!garageClient) {
    const config: GarageConfig = {
      baseUrl: process.env.GARAGE_API_URL || 'http://localhost:3903',
      adminToken: process.env.GARAGE_ADMIN_TOKEN || '',
      timeout: parseInt(process.env.GARAGE_TIMEOUT || '30000')
    };
    garageClient = new GarageClient(config);
  }
  return garageClient;
}