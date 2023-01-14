import { Exact } from "./types";
export declare class UnreachableCaseError extends Error {
  constructor(value: never);
}
export declare function assert(condition: any, msg?: string): asserts condition;
export declare function noop(..._args: unknown[]): void;
export declare const isExact: <ExpectedShape>() => <ActualShape>(x: Exact<ActualShape, ExpectedShape>) => ExpectedShape;
