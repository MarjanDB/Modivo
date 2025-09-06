import type { ConstructableClassType } from "@lib/utils/ClassType.js";

export class DependencyConstructionMethodValue {
	public constructor(public readonly value: unknown) {}
}

export class DependencyConstructionMethodFactory<FactoryArguments extends unknown[] = unknown[]> {
	public constructor(public readonly factory: (...args: FactoryArguments) => unknown) {}
}

export class DependencyConstructionMethodAsyncFactory<FactoryArguments extends unknown[] = unknown[]> {
	public constructor(public readonly factory: (...args: FactoryArguments) => Promise<unknown>) {}
}

export class DependencyConstructionMethodClass {
	public constructor(public readonly classType: ConstructableClassType<unknown>) {}
}

export type DependencyConstructionMethod<FactoryArguments extends unknown[] = unknown[]> =
	| DependencyConstructionMethodValue
	| DependencyConstructionMethodFactory<FactoryArguments>
	| DependencyConstructionMethodAsyncFactory<FactoryArguments>
	| DependencyConstructionMethodClass;
