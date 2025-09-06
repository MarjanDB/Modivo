import type { DependencyScope } from "@lib/lib/enums/DependencyScope.js";
import type {
	ProviderConstructionMethodForAsyncFactory,
	ProviderConstructionMethodForClass,
	ProviderConstructionMethodForFactory,
	ProviderConstructionMethodForValue,
} from "@lib/lib/ProviderRepresentation/ProviderConstructionMethod.js";
import type { ProviderDependencyForFunction } from "@lib/lib/ProviderRepresentation/ProviderDependency.js";
import type { ProviderIdentifier } from "@lib/lib/ProviderRepresentation/ProviderIdentifierDefinition.js";

export class ProviderDefinitionForClass<ClassArguments extends unknown[] = unknown[]> {
	public constructor(
		public readonly token: ProviderIdentifier,
		public readonly constructionMethod: ProviderConstructionMethodForClass<ClassArguments>,
		public readonly scope: DependencyScope,

		// These are passed directly to the constructor
		public readonly dependencies: ProviderDependencyForFunction[],
	) {}
}

export class ProviderDefinitionForFunction<FactoryArguments extends unknown[] = unknown[]> {
	public constructor(
		public readonly token: ProviderIdentifier,
		public readonly constructionMethod: ProviderConstructionMethodForFactory<FactoryArguments>,
		public readonly scope: DependencyScope,
		public readonly dependencies: ProviderDependencyForFunction[],
	) {}
}

export class ProviderDefinitionForAsyncFunction<FactoryArguments extends unknown[] = unknown[]> {
	public constructor(
		public readonly token: ProviderIdentifier,
		public readonly constructionMethod: ProviderConstructionMethodForAsyncFactory<FactoryArguments>,
		public readonly scope: DependencyScope,
		public readonly dependencies: ProviderDependencyForFunction[],
	) {}
}

export class ProviderDefinitionForValue {
	public constructor(
		public readonly token: ProviderIdentifier,
		public readonly constructionMethod: ProviderConstructionMethodForValue,
		public readonly scope: DependencyScope,
	) {}
}

export type ProviderDefinition<FactoryArguments extends unknown[] = unknown[]> =
	| ProviderDefinitionForClass<FactoryArguments>
	| ProviderDefinitionForFunction<FactoryArguments>
	| ProviderDefinitionForAsyncFunction<FactoryArguments>
	| ProviderDefinitionForValue;
