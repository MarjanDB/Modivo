import type { ConstructableClassType } from "@lib/utils/ClassType.js";

export class ProviderConstructionMethodForValue {
	public constructor(public readonly value: unknown) {}
}

export class ProviderConstructionMethodForFactory<FactoryArguments extends unknown[] = unknown[]> {
	public constructor(public readonly factory: (...args: FactoryArguments) => unknown) {}
}

export class ProviderConstructionMethodForAsyncFactory<FactoryArguments extends unknown[] = unknown[]> {
	public constructor(public readonly factory: (...args: FactoryArguments) => Promise<unknown>) {}
}

export class ProviderConstructionMethodForClass<ClassArguments extends unknown[] = unknown[]> {
	public constructor(public readonly classType: ConstructableClassType<any, ClassArguments>) {}
}

export type ProviderConstructionMethod<FactoryArguments extends unknown[] = unknown[]> =
	| ProviderConstructionMethodForFactory<FactoryArguments>
	| ProviderConstructionMethodForAsyncFactory<FactoryArguments>
	| ProviderConstructionMethodForClass;
