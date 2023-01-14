import { BreakpointMap, BreakpointFunction } from './types';
export declare const createBreakpoint: <B extends string | number | symbol>(breakpoints: BreakpointMap<B>) => BreakpointFunction<B>;
