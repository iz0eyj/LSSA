import axios, { AxiosInstance } from 'axios';
import { 
  ApiResponse, 
  ClusterStatus, 
  Bucket, 
  AccessKey, 
  GarageMetrics,
  CreateBucketRequest,
  UpdateBucketRequest,
  CreateAccessKeyRequest,
  UpdateAccessKeyRequest
} from '../../../shared/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Interceptor per gestire errori
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  // Test e connessione
  async testConnection(): Promise<ApiResponse<{ status: string }>> {
    const response = await this.client.get('/test/connection');
    return response.data;
  }

  async testAuth(): Promise<ApiResponse<{ authenticated: boolean }>> {
    const response = await this.client.get('/test/auth');
    return response.data;
  }

  async testSystem(): Promise<ApiResponse<any>> {
    const response = await this.client.get('/test/system');
    return response.data;
  }

  // Cluster
  async getClusterStatus(): Promise<ApiResponse<ClusterStatus>> {
    const response = await this.client.get('/cluster/status');
    return response.data;
  }

  async getClusterLayout(): Promise<ApiResponse<any>> {
    const response = await this.client.get('/cluster/layout');
    return response.data;
  }

  async getClusterInfo(): Promise<ApiResponse<any>> {
    const response = await this.client.get('/cluster/info');
    return response.data;
  }

  async getClusterStats(): Promise<ApiResponse<any>> {
    const response = await this.client.get('/cluster/stats');
    return response.data;
  }

  async getClusterStatistics(): Promise<ApiResponse<any>> {
    const response = await this.client.get('/cluster/statistics');
    return response.data;
  }

  async getClusterHealth(): Promise<ApiResponse<any>> {
    const response = await this.client.get('/cluster/health');
    return response.data;
  }

  // Bucket
  async listBuckets(): Promise<ApiResponse<Bucket[]>> {
    const response = await this.client.get('/buckets');
    return response.data;
  }

  async getBucket(bucketId: string): Promise<ApiResponse<Bucket>> {
    const response = await this.client.get(`/buckets/${bucketId}`);
    return response.data;
  }

  async createBucket(data: CreateBucketRequest): Promise<ApiResponse<Bucket>> {
    const response = await this.client.post('/buckets', data);
    return response.data;
  }

  async updateBucket(bucketId: string, data: UpdateBucketRequest): Promise<ApiResponse<Bucket>> {
    const response = await this.client.put(`/buckets/${bucketId}`, data);
    return response.data;
  }

  async deleteBucket(bucketId: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/buckets/${bucketId}`);
    return response.data;
  }

  async listBucketObjects(bucketName: string, prefix?: string, maxKeys?: number): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (prefix) params.append('prefix', prefix);
    if (maxKeys) params.append('maxKeys', maxKeys.toString());
    
    const response = await this.client.get(`/buckets/${bucketName}/objects?${params}`);
    return response.data;
  }

  async getBucketStats(): Promise<ApiResponse<any>> {
    const response = await this.client.get('/buckets/stats/summary');
    return response.data;
  }

  // Gestione oggetti
  async uploadObject(bucketName: string, objectKey: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', objectKey);
    
    const response = await this.client.post(`/buckets/${bucketName}/objects`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      }
    });
    return response.data;
  }

  async downloadObject(bucketName: string, objectKey: string): Promise<Blob> {
    const response = await this.client.get(`/buckets/${bucketName}/objects/${encodeURIComponent(objectKey)}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async deleteObject(bucketName: string, objectKey: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/buckets/${bucketName}/objects/${encodeURIComponent(objectKey)}`);
    return response.data;
  }

  // Chiavi di accesso
  async listAccessKeys(): Promise<ApiResponse<AccessKey[]>> {
    const response = await this.client.get('/keys');
    return response.data;
  }

  async getAccessKey(keyId: string): Promise<ApiResponse<AccessKey>> {
    const response = await this.client.get(`/keys/${keyId}`);
    return response.data;
  }

  async createAccessKey(data: CreateAccessKeyRequest): Promise<ApiResponse<AccessKey>> {
    const response = await this.client.post('/keys', data);
    return response.data;
  }

  async updateAccessKey(keyId: string, data: UpdateAccessKeyRequest): Promise<ApiResponse<AccessKey>> {
    const response = await this.client.put(`/keys/${keyId}`, data);
    return response.data;
  }

  async deleteAccessKey(keyId: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/keys/${keyId}`);
    return response.data;
  }

  async getAccessKeyStats(): Promise<ApiResponse<any>> {
    const response = await this.client.get('/keys/stats/summary');
    return response.data;
  }

  async getAccessKeyPermissions(keyId: string): Promise<ApiResponse<any>> {
    const response = await this.client.get(`/keys/${keyId}/permissions`);
    return response.data;
  }

  // Metriche
  async getMetrics(): Promise<ApiResponse<GarageMetrics>> {
    const response = await this.client.get('/metrics');
    return response.data;
  }

  async getRawMetrics(): Promise<string> {
    const response = await this.client.get('/metrics/raw');
    return response.data;
  }

  async getClusterMetrics(): Promise<ApiResponse<any>> {
    const response = await this.client.get('/metrics/cluster');
    return response.data;
  }

  async getStorageMetrics(): Promise<ApiResponse<any>> {
    const response = await this.client.get('/metrics/storage');
    return response.data;
  }

  async getMetricsHealth(): Promise<ApiResponse<any>> {
    const response = await this.client.get('/metrics/health');
    return response.data;
  }

  // Gestione configurazione bucket avanzata
  async updateBucketWebsite(bucketId: string, config: {
    enabled: boolean;
    indexDocument?: string;
    errorDocument?: string;
  }): Promise<ApiResponse<any>> {
    const response = await this.client.put(`/buckets/${bucketId}/website`, config);
    return response.data;
  }

  async updateBucketCors(bucketId: string, config: {
    enabled: boolean;
    origins?: string[];
    methods?: string[];
    headers?: string[];
  }): Promise<ApiResponse<any>> {
    const response = await this.client.put(`/buckets/${bucketId}/cors`, config);
    return response.data;
  }

  async addBucketAlias(bucketId: string, alias: string): Promise<ApiResponse<any>> {
    const response = await this.client.post(`/buckets/${bucketId}/aliases`, { alias });
    return response.data;
  }

  async removeBucketAlias(bucketId: string, alias: string): Promise<ApiResponse<any>> {
    const response = await this.client.delete(`/buckets/${bucketId}/aliases/${encodeURIComponent(alias)}`);
    return response.data;
  }
}

// Singleton instance
export const apiClient = new ApiClient();

// Hook personalizzati per React Query (se necessario)
export const useApi = () => {
  return {
    // Test
    testConnection: () => apiClient.testConnection(),
    testAuth: () => apiClient.testAuth(),
    testSystem: () => apiClient.testSystem(),
    
    // Cluster
    getClusterStatus: () => apiClient.getClusterStatus(),
    getClusterLayout: () => apiClient.getClusterLayout(),
    getClusterInfo: () => apiClient.getClusterInfo(),
    getClusterStats: () => apiClient.getClusterStats(),
    
    // Buckets
    listBuckets: () => apiClient.listBuckets(),
    getBucket: (id: string) => apiClient.getBucket(id),
    createBucket: (data: CreateBucketRequest) => apiClient.createBucket(data),
    updateBucket: (id: string, data: UpdateBucketRequest) => apiClient.updateBucket(id, data),
    deleteBucket: (id: string) => apiClient.deleteBucket(id),
    listBucketObjects: (name: string, prefix?: string, maxKeys?: number) => 
      apiClient.listBucketObjects(name, prefix, maxKeys),
    getBucketStats: () => apiClient.getBucketStats(),
    
    // Objects
    uploadObject: (bucketName: string, objectKey: string, file: File, onProgress?: (progress: number) => void) => 
      apiClient.uploadObject(bucketName, objectKey, file, onProgress),
    downloadObject: (bucketName: string, objectKey: string) => apiClient.downloadObject(bucketName, objectKey),
    deleteObject: (bucketName: string, objectKey: string) => apiClient.deleteObject(bucketName, objectKey),
    
    // Keys
    listAccessKeys: () => apiClient.listAccessKeys(),
    getAccessKey: (id: string) => apiClient.getAccessKey(id),
    createAccessKey: (data: CreateAccessKeyRequest) => apiClient.createAccessKey(data),
    updateAccessKey: (id: string, data: UpdateAccessKeyRequest) => apiClient.updateAccessKey(id, data),
    deleteAccessKey: (id: string) => apiClient.deleteAccessKey(id),
    getAccessKeyStats: () => apiClient.getAccessKeyStats(),
    getAccessKeyPermissions: (id: string) => apiClient.getAccessKeyPermissions(id),
    
    // Metrics
    getMetrics: () => apiClient.getMetrics(),
    getRawMetrics: () => apiClient.getRawMetrics(),
    getClusterMetrics: () => apiClient.getClusterMetrics(),
    getStorageMetrics: () => apiClient.getStorageMetrics(),
    getMetricsHealth: () => apiClient.getMetricsHealth(),
  };
};