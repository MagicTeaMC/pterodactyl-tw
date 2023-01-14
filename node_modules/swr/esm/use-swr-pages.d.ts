import { pagesResponseInterface, pageComponentType, pageOffsetMapperType } from './types';
export declare function useSWRPages<OffsetType = any, Data = any, Error = any>(pageKey: string, pageFn: pageComponentType<OffsetType, Data, Error>, SWRToOffset: pageOffsetMapperType<OffsetType, Data, Error>, deps?: any[]): pagesResponseInterface<Data, Error>;
