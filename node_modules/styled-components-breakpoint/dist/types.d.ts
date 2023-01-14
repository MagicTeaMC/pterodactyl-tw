import { DefaultTheme, css, CSSObject, StyledProps } from 'styled-components';
export declare type BreakpointNameConstraint = string | number | symbol;
export declare type BreakpointMap<B extends BreakpointNameConstraint> = {
    [breakpoint in B]: number;
};
declare type ThemeShape<B extends BreakpointNameConstraint> = {
    breakpoints: BreakpointMap<B>;
};
export declare type DefaultBreakpointName = 'mobile' | 'tablet' | 'desktop';
export declare type ThemedBreakpointName = DefaultTheme extends ThemeShape<infer B> ? B : DefaultBreakpointName;
export declare type BreakpointFunction<B extends BreakpointNameConstraint> = (breakpointA: B, breakpointB?: B) => typeof css;
export declare type ThemedBreakpointFunction<B extends BreakpointNameConstraint> = (breakpointA: B, breakpointB?: B) => <P extends object>(props: StyledProps<P>) => typeof css;
export declare type ValueConstraint = string | number | boolean;
export declare type ScaleConstraint = {
    [name: string]: any;
};
export declare type ValueOrValueMap<B extends BreakpointNameConstraint, V extends ValueConstraint> = V | {
    [breakpoint in B]?: V;
};
export declare type ThemedValueOrValueMap<V extends ValueConstraint> = ValueOrValueMap<ThemedBreakpointName, V>;
export interface ValueToStyleFunction<V extends ValueConstraint, S extends ScaleConstraint> {
    (value: V, scale?: S): string | CSSObject | ReturnType<typeof css>;
}
export interface MapFunction<B extends BreakpointNameConstraint> {
    <V extends ValueConstraint>(valueOrValues: ValueOrValueMap<B, V>, mapValueToStyle: (value: V) => string | CSSObject | ReturnType<typeof css>): any;
    <V extends ValueConstraint, S extends ScaleConstraint>(valueOrValues: ValueOrValueMap<B, V>, mapValueToStyle: (value: V, scale: S) => string | CSSObject | ReturnType<typeof css>, scale: S | ((theme: DefaultTheme) => S)): any;
}
export {};
