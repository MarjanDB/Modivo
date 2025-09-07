import { ContainerHierarchyResolver } from "@lib/lib/ContainerRepresentation/ContainerHierarchyResolver.js";
import type { ContainerRepresentation } from "@lib/lib/ContainerRepresentation/ContainerRepresentation.js";
import { ContainerResolver } from "@lib/lib/ContainerRepresentation/ContainerResolver.js";
import { ProviderScope } from "@lib/lib/enums/ProviderScope.js";
import type { ProviderIdentifier } from "@lib/lib/ProviderRepresentation/ProviderIdentifierDefinition.js";

export class Container {
	private readonly containerResolver: ContainerResolver;
	private readonly containerHierarchyResolver: ContainerHierarchyResolver;
	private readonly resolvedSingletoneDependencies: Map<ProviderIdentifier, unknown> = new Map();

	public constructor(
		public readonly containerRepresentation: ContainerRepresentation,
		public readonly parentContainer: Container | null = null,
	) {
		this.containerResolver = new ContainerResolver(this);
		this.containerHierarchyResolver = new ContainerHierarchyResolver(this);
	}

	public resolveProvider(dependencyToken: ProviderIdentifier): unknown {
		return this.containerHierarchyResolver.resolveProvider(dependencyToken);
	}

	public resolveLocalProvider(dependencyToken: ProviderIdentifier): unknown {
		const dependencyEntry = this.containerRepresentation.lookupProviderEntry(dependencyToken);

		if (!dependencyEntry) {
			throw new Error(`Dependency ${dependencyToken} not found`);
		}

		if (dependencyEntry.scope === ProviderScope.SINGLETON) {
			if (this.resolvedSingletoneDependencies.has(dependencyToken)) {
				return this.resolvedSingletoneDependencies.get(dependencyToken);
			}

			const resolvedDependency = this.containerResolver.resolveProvider(dependencyToken);
			this.resolvedSingletoneDependencies.set(dependencyToken, resolvedDependency);
			return resolvedDependency;
		}

		if (dependencyEntry.scope === ProviderScope.TRANSIENT) {
			return this.containerResolver.resolveProvider(dependencyToken);
		}

		throw new Error(`Dependency ${dependencyToken} has an invalid scope`);
	}
}
