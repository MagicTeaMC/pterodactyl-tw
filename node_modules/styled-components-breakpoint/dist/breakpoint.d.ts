import { StyledProps, css } from 'styled-components';
declare type CSSFunction = (...params: Parameters<typeof css>) => <P extends object>({ theme }: StyledProps<P>) => ReturnType<typeof css>;
export declare const breakpoint: (breakpointA: import("./types").DefaultBreakpointName, breakpointB?: "mobile" | "tablet" | "desktop" | undefined) => CSSFunction;
export {};
