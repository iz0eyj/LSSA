export interface GarageConfig {
    baseUrl: string;
    adminToken: string;
    timeout?: number;
}
export interface ClusterStatus {
    status: 'healthy' | 'degraded' | 'error';
    nodes: ClusterNode[];
    layout_version: number;
    staged_layout_version?: number;
}
export interface ClusterNode {
    id: string;
    addr: string;
    hostname?: string;
    is_up: boolean;
    last_seen_secs_ago?: number;
    data_partition?: string;
    meta_partition?: string;
    zone: string;
    capacity?: number;
    tags: string[];
}
export interface Bucket {
    id: string;
    global_aliases: string[];
    local_aliases: BucketLocalAlias[];
    website_access: boolean;
    cors_rules?: CorsRule[];
    lifecycle_config?: LifecycleConfig;
    quotas: BucketQuotas;
}
export interface BucketLocalAlias {
    access_key_id: string;
    alias: string;
    allow: BucketPermissions;
}
export interface BucketPermissions {
    read: boolean;
    write: boolean;
    owner: boolean;
}
export interface CorsRule {
    id?: string;
    max_age_seconds?: number;
    allowed_origins: string[];
    allowed_headers: string[];
    allowed_methods: string[];
    expose_headers?: string[];
}
export interface LifecycleConfig {
    rules: LifecycleRule[];
}
export interface LifecycleRule {
    id: string;
    status: 'Enabled' | 'Disabled';
    filter?: {
        prefix?: string;
        tags?: Record<string, string>;
    };
    expiration?: {
        days?: number;
        date?: string;
    };
    abort_incomplete_multipart_upload?: {
        days_after_initiation: number;
    };
}
export interface BucketQuotas {
    max_size?: number;
    max_objects?: number;
}
export interface AccessKey {
    id: string;
    name?: string;
    created: string;
    expiration?: string | null;
    expired: boolean;
    secret_access_key?: string;
    permissions?: AccessKeyPermissions;
    bucket_aliases?: string[];
    bucket_permissions?: Record<string, BucketPermissions>;
}
export interface AccessKeyPermissions {
    create_bucket: boolean;
}
export interface S3Object {
    key: string;
    last_modified: string;
    size: number;
    etag: string;
    storage_class?: string;
    owner?: {
        id: string;
        display_name: string;
    };
}
export interface ListObjectsResponse {
    is_truncated: boolean;
    contents: S3Object[];
    name: string;
    prefix?: string;
    delimiter?: string;
    max_keys: number;
    common_prefixes?: string[];
    next_continuation_token?: string;
}
export interface UploadObjectRequest {
    key: string;
    file: Buffer | Uint8Array;
    contentType?: string;
    metadata?: Record<string, string>;
}
export interface UploadObjectResponse {
    key: string;
    etag: string;
    size: number;
    location: string;
}
export interface DeleteObjectRequest {
    key: string;
}
export interface DeleteObjectResponse {
    deleted: boolean;
    key: string;
}
export interface GarageMetrics {
    cluster: {
        nodes_total: number;
        nodes_up: number;
        layout_version: number;
    };
    storage: {
        total_capacity: number;
        used_capacity: number;
        available_capacity: number;
    };
    buckets: {
        total_count: number;
    };
    objects: {
        total_count: number;
        total_size: number;
    };
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface ApiError {
    code: string;
    message: string;
    details?: any;
}
export declare enum BucketVisibility {
    PRIVATE = "private",
    PUBLIC = "public"
}
export interface BucketVisibilityOptions {
    visibility: BucketVisibility;
    website_access: boolean;
    cors_enabled: boolean;
}
export interface CreateBucketRequest {
    global_alias?: string;
    local_alias?: {
        access_key_id: string;
        alias: string;
        allow: BucketPermissions;
    };
    visibility_options?: BucketVisibilityOptions;
}
export interface UpdateBucketRequest {
    website_access?: boolean;
    cors_rules?: CorsRule[];
    lifecycle_config?: LifecycleConfig;
    quotas?: BucketQuotas;
}
export interface CreateAccessKeyRequest {
    name?: string;
}
export interface UpdateAccessKeyRequest {
    name?: string;
    permissions?: AccessKeyPermissions;
    bucket_aliases?: string[];
    bucket_permissions?: Record<string, BucketPermissions>;
}
export type SortDirection = 'asc' | 'desc';
export type BucketSortField = 'name' | 'created' | 'size' | 'objects';
export type KeySortField = 'name' | 'created' | 'permissions';
export interface SortOptions<T extends string> {
    field: T;
    direction: SortDirection;
}
export interface PaginationOptions {
    page: number;
    limit: number;
}
export interface FilterOptions {
    search?: string;
    tags?: string[];
}
//# sourceMappingURL=types.d.ts.map