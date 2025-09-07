import type {
	PropertyIdentifier,
	ProviderIdentifier,
} from "@lib/lib/ProviderRepresentation/ProviderIdentifierDefinition.js";

export class ProviderDependencyForClass {
	public constructor(
		public readonly propertyKey: PropertyIdentifier,
		public readonly dependencyToken: ProviderIdentifier,
	) {}
}
export class ProviderDependencyForFunction {
	public constructor(public readonly dependencyToken: ProviderIdentifier) {}
}
