import { ContainerProviderLookup } from "@lib/lib/Container/ContainerProviderLookup.js";
import { ProviderScope } from "@lib/lib/enums/ProviderScope.js";
import type { ProviderDefinition } from "@lib/lib/ProviderRepresentation/ProviderDefinition.js";
import type { ProviderIdentifier } from "@lib/lib/ProviderRepresentation/ProviderIdentifierDefinition.js";

export class ContainerRepresentation {
	public constructor(
		private readonly providerScopeLookup = new Map<ProviderIdentifier, ProviderScope>(),
		private readonly providerLookupForSingletonDependencies = new ContainerProviderLookup(),
		private readonly providerLookupForTransientDependencies = new ContainerProviderLookup(),
	) {}

	public registerDependency<FactoryArguments extends unknown[] = unknown[]>(
		dependencyEntry: ProviderDefinition<FactoryArguments>,
	): void {
		const generalCastOfDependencyEntry = dependencyEntry as ProviderDefinition<unknown[]>;

		if (dependencyEntry.scope === ProviderScope.SINGLETON) {
			this.providerLookupForSingletonDependencies.registerDependency(generalCastOfDependencyEntry);
			this.providerScopeLookup.set(dependencyEntry.token, ProviderScope.SINGLETON);
			return;
		}

		if (dependencyEntry.scope === ProviderScope.TRANSIENT) {
			this.providerLookupForTransientDependencies.registerDependency(generalCastOfDependencyEntry);
			this.providerScopeLookup.set(dependencyEntry.token, ProviderScope.TRANSIENT);
			return;
		}
	}

	public overrideDependency<FactoryArguments extends unknown[] = unknown[]>(
		dependencyEntry: ProviderDefinition<FactoryArguments>,
	): void {
		const generalCastOfDependencyEntry = dependencyEntry as ProviderDefinition<unknown[]>;

		if (dependencyEntry.scope === ProviderScope.SINGLETON) {
			this.providerLookupForSingletonDependencies.overrideDependency(generalCastOfDependencyEntry);
			return;
		}

		if (dependencyEntry.scope === ProviderScope.TRANSIENT) {
			this.providerLookupForTransientDependencies.overrideDependency(generalCastOfDependencyEntry);
			return;
		}
	}

	public lookupDependencyEntry(dependencyToken: ProviderIdentifier): ProviderDefinition<unknown[]> | null {
		const scope = this.providerScopeLookup.get(dependencyToken);

		if (scope === ProviderScope.SINGLETON) {
			return this.providerLookupForSingletonDependencies.lookupDependencyEntry(dependencyToken);
		}

		if (scope === ProviderScope.TRANSIENT) {
			return this.providerLookupForTransientDependencies.lookupDependencyEntry(dependencyToken);
		}

		return null;
	}
}
