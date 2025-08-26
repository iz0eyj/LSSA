// Tipi e enum per la gestione dei bucket

export enum BucketVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public'
}

export interface BucketVisibilityOptions {
  visibility: BucketVisibility;
  website_access: boolean;
  cors_enabled: boolean;
}