import type {
	ProviderConstructionMethodForAsyncFactory,
	ProviderConstructionMethodForClass,
	ProviderConstructionMethodForFactory,
	ProviderConstructionMethodForValue,
} from "@lib/lib/ProviderRepresentation/ProviderConstructionMethod.js";
import type { ProviderDependencyForFunction } from "@lib/lib/ProviderRepresentation/ProviderDependency.js";
import type { ProviderIdentifier } from "@lib/lib/ProviderRepresentation/ProviderIdentifierDefinition.js";
import type { ProviderScope } from "@lib/lib/ProviderRepresentation/ProviderScope.js";

export class ProviderDefinitionForClass<ClassArguments extends unknown[] = unknown[]> {
	public constructor(
		public readonly token: ProviderIdentifier,
		public readonly constructionMethod: ProviderConstructionMethodForClass<ClassArguments>,
		public readonly scope: ProviderScope,

		// These are passed directly to the constructor
		public readonly dependencies: ProviderDependencyForFunction[],
	) {}
}

export class ProviderDefinitionForFunction<FactoryArguments extends unknown[] = unknown[]> {
	public constructor(
		public readonly token: ProviderIdentifier,
		public readonly constructionMethod: ProviderConstructionMethodForFactory<FactoryArguments>,
		public readonly scope: ProviderScope,
		public readonly dependencies: ProviderDependencyForFunction[],
	) {}
}

export class ProviderDefinitionForAsyncFunction<FactoryArguments extends unknown[] = unknown[]> {
	public constructor(
		public readonly token: ProviderIdentifier,
		public readonly constructionMethod: ProviderConstructionMethodForAsyncFactory<FactoryArguments>,
		public readonly scope: ProviderScope,
		public readonly dependencies: ProviderDependencyForFunction[],
	) {}
}

export class ProviderDefinitionForValue {
	public constructor(
		public readonly token: ProviderIdentifier,
		public readonly constructionMethod: ProviderConstructionMethodForValue,
		public readonly scope: ProviderScope,
	) {}
}

export type ProviderDefinition<FactoryArguments extends unknown[] = unknown[]> =
	| ProviderDefinitionForClass<FactoryArguments>
	| ProviderDefinitionForFunction<FactoryArguments>
	| ProviderDefinitionForAsyncFunction<FactoryArguments>
	| ProviderDefinitionForValue;
