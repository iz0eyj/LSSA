import { ListObjectsResponse, UploadObjectRequest, UploadObjectResponse, DeleteObjectResponse, ApiResponse } from '../types';
export declare class GarageS3Client {
    private s3Client;
    private config;
    constructor();
    private formatError;
    listObjects(bucketName: string, prefix?: string, maxKeys?: number): Promise<ApiResponse<ListObjectsResponse>>;
    uploadObject(bucketName: string, request: UploadObjectRequest): Promise<ApiResponse<UploadObjectResponse>>;
    deleteObject(bucketName: string, objectKey: string): Promise<ApiResponse<DeleteObjectResponse>>;
    downloadObject(bucketName: string, objectKey: string): Promise<ApiResponse<Buffer>>;
    putBucketWebsite(bucketName: string, config: {
        indexDocument: string;
        errorDocument?: string;
    }): Promise<ApiResponse<any>>;
    deleteBucketWebsite(bucketName: string): Promise<ApiResponse<any>>;
    putBucketCors(bucketName: string, config: {
        origins: string[];
        methods: string[];
        headers: string[];
    }): Promise<ApiResponse<any>>;
    deleteBucketCors(bucketName: string): Promise<ApiResponse<any>>;
    getObjectUrl(bucketName: string, objectKey: string): Promise<string>;
}
export declare function getS3Client(): GarageS3Client;
//# sourceMappingURL=s3Client.d.ts.map