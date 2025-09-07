import { ContainerProviderLookup } from "@lib/lib/ContainerRepresentation/ContainerProviderLookup.js";
import type { ProviderDefinition } from "@lib/lib/ProviderRepresentation/ProviderDefinition.js";
import type { ProviderIdentifier } from "@lib/lib/ProviderRepresentation/ProviderIdentifierDefinition.js";
import { ProviderScope } from "@lib/lib/ProviderRepresentation/ProviderScope.js";

export class ContainerRepresentation {
	public constructor(
		private readonly providerScopeLookup = new Map<ProviderIdentifier, ProviderScope>(),
		private readonly providerLookupForSingletonDependencies = new ContainerProviderLookup(),
		private readonly providerLookupForTransientDependencies = new ContainerProviderLookup(),
	) {}

	public registerProvider<FactoryArguments extends unknown[] = unknown[]>(
		dependencyEntry: ProviderDefinition<FactoryArguments>,
	): void {
		const generalCastOfDependencyEntry = dependencyEntry as ProviderDefinition<unknown[]>;

		if (dependencyEntry.scope === ProviderScope.SINGLETON) {
			this.providerLookupForSingletonDependencies.registerProvider(generalCastOfDependencyEntry);
			this.providerScopeLookup.set(dependencyEntry.token, ProviderScope.SINGLETON);
			return;
		}

		if (dependencyEntry.scope === ProviderScope.TRANSIENT) {
			this.providerLookupForTransientDependencies.registerProvider(generalCastOfDependencyEntry);
			this.providerScopeLookup.set(dependencyEntry.token, ProviderScope.TRANSIENT);
			return;
		}
	}

	public overrideProvider<FactoryArguments extends unknown[] = unknown[]>(
		dependencyEntry: ProviderDefinition<FactoryArguments>,
	): void {
		const generalCastOfDependencyEntry = dependencyEntry as ProviderDefinition<unknown[]>;

		if (dependencyEntry.scope === ProviderScope.SINGLETON) {
			this.providerLookupForSingletonDependencies.overrideProvider(generalCastOfDependencyEntry);
			return;
		}

		if (dependencyEntry.scope === ProviderScope.TRANSIENT) {
			this.providerLookupForTransientDependencies.overrideProvider(generalCastOfDependencyEntry);
			return;
		}
	}

	public lookupProviderEntry(dependencyToken: ProviderIdentifier): ProviderDefinition<unknown[]> | null {
		const scope = this.providerScopeLookup.get(dependencyToken);

		if (scope === ProviderScope.SINGLETON) {
			return this.providerLookupForSingletonDependencies.lookupProviderEntry(dependencyToken);
		}

		if (scope === ProviderScope.TRANSIENT) {
			return this.providerLookupForTransientDependencies.lookupProviderEntry(dependencyToken);
		}

		return null;
	}
}
