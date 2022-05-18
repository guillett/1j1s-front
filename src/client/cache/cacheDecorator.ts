import { AppRawDataStorage } from '~/client/cache/appRawDataStorage';

export class Cachable {
  storage: AppRawDataStorage;

  constructor(protected readonly appRawDataStorage: AppRawDataStorage) {
    this.storage = appRawDataStorage;
  }
}

interface CacheParams {
  key: string;
  storage?: AppRawDataStorage;
}

const missingStorageErrorMessage =
  'Cache cannot be used. To use it, please specify the storage to use :\n' +
  '- either in the @cache parameters \n' +
  '- or  by setting a "storage" property in the class" ';

export function cache({ key, storage }: CacheParams) {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor): void => {
    const originalMethod = descriptor.value;

    (descriptor as PropertyDescriptor & { storage: AppRawDataStorage }).value = function (...args: unknown[]) {
      const selectedStorage = getSelectedStorage(this.storage, storage);

      const cacheKey = `${key}__${JSON.stringify(args)}`;
      const cachedResult = selectedStorage.get(cacheKey);

      if (cachedResult !== null) {
        return Promise.resolve(cachedResult);
      }

      const result = originalMethod.apply(this, args);

      if (result instanceof Promise) {
        result.then((resultData) => {
          selectedStorage.set(cacheKey, resultData);
        });
      }

      return result;
    };
  };
}

export function removeCache({ key, storage }: CacheParams) {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor): void => {
    const originalMethod = descriptor.value;

    (descriptor as PropertyDescriptor & { storage: AppRawDataStorage }).value = function (...args: unknown[]) {
      const selectedStorage = getSelectedStorage(this.storage, storage);
      const keyPrefix = `${key}__`;

      selectedStorage.clearItem(keyPrefix, true);

      return originalMethod.apply(this, args);
    };
  };
}

function getSelectedStorage(classStorage: AppRawDataStorage, paramStorage?: AppRawDataStorage): AppRawDataStorage {
  if (classStorage === undefined && paramStorage === undefined) {
    // tslint:disable-next-line:no-console
    console.error(missingStorageErrorMessage); // eslint-disable-line no-console
    throw new Error(missingStorageErrorMessage);
  }

  return paramStorage || classStorage;
}