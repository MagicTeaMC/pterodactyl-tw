import { BreakpointMap, MapFunction } from './types';
import { DefaultTheme } from 'styled-components';
export declare const createMap: <B extends string | number | symbol>(breakpoints: BreakpointMap<B> | ((theme: DefaultTheme) => BreakpointMap<B>)) => MapFunction<B>;
