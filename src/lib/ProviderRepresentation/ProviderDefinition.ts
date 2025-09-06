import type { DependencyScope } from "@lib/lib/enums/DependencyScope.js";
import type {
	ProviderConstructionMethodForAsyncFactory,
	ProviderConstructionMethodForClass,
	ProviderConstructionMethodForFactory,
	ProviderConstructionMethodForValue,
} from "@lib/lib/ProviderRepresentation/ProviderConstructionMethod.js";
import type {
	ProviderDependencyForClass,
	ProviderDependencyForFunction,
} from "@lib/lib/ProviderRepresentation/ProviderDependency.js";
import type { ProviderIdentifier } from "@lib/lib/ProviderRepresentation/ProviderIdentifierDefinition.js";

export class ProviderDefinitionForClass {
	public constructor(
		public readonly token: ProviderIdentifier,
		public readonly constructionMethod: ProviderConstructionMethodForClass,
		public readonly scope: DependencyScope,
		public readonly dependencies: ProviderDependencyForClass[],
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
	| ProviderDefinitionForClass
	| ProviderDefinitionForFunction<FactoryArguments>
	| ProviderDefinitionForAsyncFunction<FactoryArguments>
	| ProviderDefinitionForValue;
