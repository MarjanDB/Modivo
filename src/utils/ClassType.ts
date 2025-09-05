export type ConstructableClassType<T> = new (...args: unknown[]) => T;
export type AbstractClassType<T> = abstract new (...args: unknown[]) => T;

export type ClassType<T> = ConstructableClassType<T> | AbstractClassType<T>;
