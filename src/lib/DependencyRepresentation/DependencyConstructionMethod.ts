import type { ConstructableClassType } from "@lib/utils/ClassType.js";

export class DependencyConstructionMethodValue {
	public constructor(public readonly value: unknown) {}
}

export class DependencyConstructionMethodFactory {
	public constructor(public readonly factory: () => unknown) {}
}

export class DependencyConstructionMethodAsyncFactory {
	public constructor(public readonly factory: () => Promise<unknown>) {}
}

export class DependencyConstructionMethodClass {
	public constructor(public readonly classType: ConstructableClassType<unknown>) {}
}

export type DependencyConstructionMethod =
	| DependencyConstructionMethodValue
	| DependencyConstructionMethodFactory
	| DependencyConstructionMethodAsyncFactory
	| DependencyConstructionMethodClass;
