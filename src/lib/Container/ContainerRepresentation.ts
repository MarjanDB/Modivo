import { ContainerProviderLookup } from "@lib/lib/Container/ContainerProviderLookup.js";
import { DependencyScope } from "@lib/lib/enums/DependencyScope.js";
import type { ProviderDefinition } from "@lib/lib/ProviderRepresentation/ProviderDefinition.js";
import type { ProviderIdentifier } from "@lib/lib/ProviderRepresentation/ProviderIdentifierDefinition.js";

export class ContainerRepresentation {
	public constructor(
		private readonly providerScopeLookup = new Map<ProviderIdentifier, DependencyScope>(),
		private readonly providerLookupForSingletonDependencies = new ContainerProviderLookup(),
		private readonly providerLookupForTransientDependencies = new ContainerProviderLookup(),
	) {}

	public registerDependency<FactoryArguments extends unknown[] = unknown[]>(
		dependencyEntry: ProviderDefinition<FactoryArguments>,
	): void {
		const generalCastOfDependencyEntry = dependencyEntry as ProviderDefinition<unknown[]>;

		if (dependencyEntry.scope === DependencyScope.SINGLETON) {
			this.providerLookupForSingletonDependencies.registerDependency(generalCastOfDependencyEntry);
			this.providerScopeLookup.set(dependencyEntry.token, DependencyScope.SINGLETON);
			return;
		}

		if (dependencyEntry.scope === DependencyScope.TRANSIENT) {
			this.providerLookupForTransientDependencies.registerDependency(generalCastOfDependencyEntry);
			this.providerScopeLookup.set(dependencyEntry.token, DependencyScope.TRANSIENT);
			return;
		}
	}

	public lookupDependencyEntry(dependencyToken: ProviderIdentifier): ProviderDefinition<unknown[]> | null {
		const scope = this.providerScopeLookup.get(dependencyToken);

		if (scope === DependencyScope.SINGLETON) {
			return this.providerLookupForSingletonDependencies.lookupDependencyEntry(dependencyToken);
		}

		if (scope === DependencyScope.TRANSIENT) {
			return this.providerLookupForTransientDependencies.lookupDependencyEntry(dependencyToken);
		}

		return null;
	}
}
