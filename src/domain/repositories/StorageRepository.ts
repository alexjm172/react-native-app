export interface StorageRepository {
  upload(localUri: string, destPath: string): Promise<{ url: string; path: string }>;
  delete(path: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
}