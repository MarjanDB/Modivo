import {
	type ProviderDefinition,
	ProviderDefinitionForClass,
	ProviderDefinitionForFunction,
	ProviderDefinitionForValue,
} from "@lib/lib/ProviderRepresentation/ProviderDefinition.js";
import type { ProviderIdentifier } from "@lib/lib/ProviderRepresentation/ProviderIdentifierDefinition.js";

export class ContainerProviderLookup {
	private readonly mapOfDependencyTokenToDependencyEntry: Map<ProviderIdentifier, ProviderDefinition<unknown[]>> =
		new Map();

	private readonly mapOfDependencyTokenToDependencyEntryForFactory: Map<
		ProviderIdentifier,
		ProviderDefinitionForFunction
	> = new Map();

	private readonly mapOfDependencyTokenToDependencyEntryForValue: Map<
		ProviderIdentifier,
		ProviderDefinitionForValue
	> = new Map();

	private readonly mapOfDependencyTokenToDependencyEntryForClass: Map<
		ProviderIdentifier,
		ProviderDefinitionForClass
	> = new Map();

	public registerProvider(dependencyEntry: ProviderDefinition<unknown[]>): void {
		// check if it's already registered
		if (this.mapOfDependencyTokenToDependencyEntry.has(dependencyEntry.token)) {
			throw new Error(`Dependency ${dependencyEntry.token} already registered`);
		}

		this.mapOfDependencyTokenToDependencyEntry.set(dependencyEntry.token, dependencyEntry);

		if (dependencyEntry instanceof ProviderDefinitionForFunction) {
			this.mapOfDependencyTokenToDependencyEntryForFactory.set(dependencyEntry.token, dependencyEntry);
		}

		if (dependencyEntry instanceof ProviderDefinitionForValue) {
			this.mapOfDependencyTokenToDependencyEntryForValue.set(dependencyEntry.token, dependencyEntry);
		}

		if (dependencyEntry instanceof ProviderDefinitionForClass) {
			this.mapOfDependencyTokenToDependencyEntryForClass.set(dependencyEntry.token, dependencyEntry);
		}
	}

	public overrideProvider(dependencyEntry: ProviderDefinition<unknown[]>): void {
		if (!this.mapOfDependencyTokenToDependencyEntry.has(dependencyEntry.token)) {
			throw new Error(`Dependency ${dependencyEntry.token} not yet registered. Use registerDependency instead.`);
		}

		this.mapOfDependencyTokenToDependencyEntry.set(dependencyEntry.token, dependencyEntry);

		if (dependencyEntry instanceof ProviderDefinitionForFunction) {
			this.mapOfDependencyTokenToDependencyEntryForFactory.set(dependencyEntry.token, dependencyEntry);
		}

		if (dependencyEntry instanceof ProviderDefinitionForValue) {
			this.mapOfDependencyTokenToDependencyEntryForValue.set(dependencyEntry.token, dependencyEntry);
		}

		if (dependencyEntry instanceof ProviderDefinitionForClass) {
			this.mapOfDependencyTokenToDependencyEntryForClass.set(dependencyEntry.token, dependencyEntry);
		}
	}

	public lookupProviderEntry(dependencyToken: ProviderIdentifier): ProviderDefinition<unknown[]> | null {
		return this.mapOfDependencyTokenToDependencyEntry.get(dependencyToken) ?? null;
	}

	public lookupProviderEntryForFactory(dependencyToken: ProviderIdentifier): ProviderDefinitionForFunction | null {
		return this.mapOfDependencyTokenToDependencyEntryForFactory.get(dependencyToken) ?? null;
	}

	public lookupProviderEntryForValue(dependencyToken: ProviderIdentifier): ProviderDefinitionForValue | null {
		return this.mapOfDependencyTokenToDependencyEntryForValue.get(dependencyToken) ?? null;
	}

	public lookupProviderEntryForClass(dependencyToken: ProviderIdentifier): ProviderDefinitionForClass | null {
		return this.mapOfDependencyTokenToDependencyEntryForClass.get(dependencyToken) ?? null;
	}
}
