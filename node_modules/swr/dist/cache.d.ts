import { CacheInterface, keyInterface, cacheListener } from './types';
export default class Cache implements CacheInterface {
    private __cache;
    private __listeners;
    constructor(initialData?: any);
    get(key: keyInterface): any;
    set(key: keyInterface, value: any, shouldNotify?: boolean): any;
    keys(): string[];
    has(key: keyInterface): boolean;
    clear(shouldNotify?: boolean): void;
    delete(key: keyInterface, shouldNotify?: boolean): void;
    serializeKey(key: keyInterface): [string, any, string];
    subscribe(listener: cacheListener): () => void;
    private notify;
}
