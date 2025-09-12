export type ConstructableClassType<T, Arguments extends any[] = any[]> = new (...args: Arguments) => T;
export type AbstractClassType<T, Arguments extends any[] = any[]> = abstract new (...args: Arguments) => T;

export type ClassType<T> = ConstructableClassType<T> | AbstractClassType<T>;
