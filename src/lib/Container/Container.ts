import type { ContainerRepresentation } from "@lib/lib/Container/ContainerRepresentation.js";
import { ContainerResolver } from "@lib/lib/Container/ContainerResolver.js";
import type { DependencyTokenDefinition } from "@lib/lib/DependencyRepresentation/DependencyTokenDefinition.js";
import { DependencyScope } from "@lib/lib/enums/DependencyScope.js";

export class Container {
	private readonly containerResolver: ContainerResolver;

	public constructor(public readonly containerRepresentation: ContainerRepresentation) {
		this.containerResolver = new ContainerResolver(this);
	}

	private readonly resolvedSingletoneDependencies: Map<DependencyTokenDefinition, unknown> = new Map();

	public resolveDependency(dependencyToken: DependencyTokenDefinition): unknown {
		const dependencyEntry = this.containerRepresentation.lookupDependencyEntry(dependencyToken);

		if (!dependencyEntry) {
			throw new Error(`Dependency ${dependencyToken} not found`);
		}

		if (dependencyEntry.scope === DependencyScope.SINGLETON) {
			if (this.resolvedSingletoneDependencies.has(dependencyToken)) {
				return this.resolvedSingletoneDependencies.get(dependencyToken);
			}

			const resolvedDependency = this.containerResolver.resolveDependency(dependencyToken);
			this.resolvedSingletoneDependencies.set(dependencyToken, resolvedDependency);
			return resolvedDependency;
		}

		if (dependencyEntry.scope === DependencyScope.TRANSIENT) {
			return this.containerResolver.resolveDependency(dependencyToken);
		}

		throw new Error(`Dependency ${dependencyToken} has an invalid scope`);
	}
}
