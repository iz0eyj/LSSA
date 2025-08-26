import { GarageConfig, ClusterStatus, Bucket, AccessKey, ListObjectsResponse, CreateBucketRequest, UpdateBucketRequest, CreateAccessKeyRequest, UpdateAccessKeyRequest, UploadObjectRequest, UploadObjectResponse, DeleteObjectResponse, ApiResponse } from '../../../shared/types';
export declare class GarageClient {
    private client;
    private config;
    constructor(config: GarageConfig);
    private formatError;
    testConnection(): Promise<ApiResponse<{
        status: string;
    }>>;
    getClusterStatus(): Promise<ApiResponse<ClusterStatus>>;
    getClusterLayout(): Promise<ApiResponse<any>>;
    listBuckets(): Promise<ApiResponse<Bucket[]>>;
    getBucket(bucketId: string): Promise<ApiResponse<Bucket>>;
    createBucket(request: CreateBucketRequest): Promise<ApiResponse<Bucket>>;
    updateBucket(bucketId: string, request: UpdateBucketRequest): Promise<ApiResponse<Bucket>>;
    deleteBucket(bucketId: string): Promise<ApiResponse<void>>;
    listAccessKeys(): Promise<ApiResponse<AccessKey[]>>;
    getAccessKey(keyId: string): Promise<ApiResponse<AccessKey>>;
    createAccessKey(request: CreateAccessKeyRequest): Promise<ApiResponse<AccessKey>>;
    updateAccessKey(keyId: string, request: UpdateAccessKeyRequest): Promise<ApiResponse<AccessKey>>;
    deleteAccessKey(keyId: string): Promise<ApiResponse<void>>;
    allowBucketKey(bucketId: string, accessKeyId: string, permissions: {
        read?: boolean;
        write?: boolean;
        owner?: boolean;
    }): Promise<ApiResponse<any>>;
    denyBucketKey(bucketId: string, accessKeyId: string, permissions: {
        read?: boolean;
        write?: boolean;
        owner?: boolean;
    }): Promise<ApiResponse<any>>;
    listObjects(bucketName: string, prefix?: string, maxKeys?: number): Promise<ApiResponse<ListObjectsResponse>>;
    uploadObject(bucketName: string, request: UploadObjectRequest): Promise<ApiResponse<UploadObjectResponse>>;
    deleteObject(bucketName: string, objectKey: string): Promise<ApiResponse<DeleteObjectResponse>>;
    downloadObject(bucketName: string, objectKey: string): Promise<ApiResponse<Buffer>>;
    updateBucketWebsite(bucketId: string, config: {
        enabled: boolean;
        indexDocument?: string;
        errorDocument?: string;
    }): Promise<ApiResponse<any>>;
    updateBucketCors(bucketId: string, config: {
        enabled: boolean;
        origins?: string[];
        methods?: string[];
        headers?: string[];
    }): Promise<ApiResponse<any>>;
    addBucketAlias(bucketId: string, alias: string): Promise<ApiResponse<any>>;
    removeBucketAlias(bucketId: string, alias: string): Promise<ApiResponse<any>>;
    getMetrics(): Promise<ApiResponse<string>>;
    getClusterStatistics(): Promise<ApiResponse<any>>;
    getClusterHealth(): Promise<ApiResponse<any>>;
}
export declare function getGarageClient(): GarageClient;
//# sourceMappingURL=garageClient.d.ts.map