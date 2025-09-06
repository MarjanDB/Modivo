import { ContainerHierarchyResolver } from "@lib/lib/Container/ContainerHierarchyResolver.js";
import type { ContainerRepresentation } from "@lib/lib/Container/ContainerRepresentation.js";
import { ContainerResolver } from "@lib/lib/Container/ContainerResolver.js";
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

	public resolveDependency(dependencyToken: ProviderIdentifier): unknown {
		return this.containerHierarchyResolver.resolveDependency(dependencyToken);
	}

	public resolveLocalDependency(dependencyToken: ProviderIdentifier): unknown {
		const dependencyEntry = this.containerRepresentation.lookupDependencyEntry(dependencyToken);

		if (!dependencyEntry) {
			throw new Error(`Dependency ${dependencyToken} not found`);
		}

		if (dependencyEntry.scope === ProviderScope.SINGLETON) {
			if (this.resolvedSingletoneDependencies.has(dependencyToken)) {
				return this.resolvedSingletoneDependencies.get(dependencyToken);
			}

			const resolvedDependency = this.containerResolver.resolveDependency(dependencyToken);
			this.resolvedSingletoneDependencies.set(dependencyToken, resolvedDependency);
			return resolvedDependency;
		}

		if (dependencyEntry.scope === ProviderScope.TRANSIENT) {
			return this.containerResolver.resolveDependency(dependencyToken);
		}

		throw new Error(`Dependency ${dependencyToken} has an invalid scope`);
	}
}
