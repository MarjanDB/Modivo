export type ConstructableClassType<T extends object, Arguments extends any[] = any[]> = new (...args: Arguments) => T;
export type AbstractClassType<T extends object, Arguments extends any[] = any[]> = abstract new (
	...args: Arguments
) => T;

export type ClassType<T extends object> = ConstructableClassType<T> | AbstractClassType<T>;
