export type ConstructableClassType<T, Arguments extends unknown[] = unknown[]> = new (...args: Arguments) => T;
export type AbstractClassType<T, Arguments extends unknown[] = unknown[]> = abstract new (...args: Arguments) => T;

export type ClassType<T> = ConstructableClassType<T> | AbstractClassType<T>;
