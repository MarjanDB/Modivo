import type { Container } from "@lib/lib/Container/Container.js";
import type { ProviderIdentifier } from "@lib/lib/ProviderRepresentation/ProviderIdentifierDefinition.js";

export class ContainerHierarchyResolver {
	public constructor(private readonly container: Container) {}

	public resolveDependency(dependencyToken: ProviderIdentifier): unknown {
		// First attempt to resolve on the current container
		const currentContainerResolvedProvider = this.resolveForContainer(this.container, dependencyToken);

		if (currentContainerResolvedProvider) {
			return currentContainerResolvedProvider;
		}

		// If it isn't present, and there's also no parent container, there is nothing more we can do.
		if (!this.container.parentContainer) {
			throw new Error(`Dependency ${dependencyToken} not found`);
		}

		// But if there is a parent container, we can traverse up the hierarchy until we're able to resolve the dependency
		// Or until we reach the top container and have nothing more to traverse
		const parentContainerResolvedProvider = this.recursiveContainerTraversal(
			this.container.parentContainer,
			dependencyToken,
		);

		if (!parentContainerResolvedProvider) {
			throw new Error(`Dependency ${dependencyToken} not found`);
		}

		return parentContainerResolvedProvider;
	}

	private resolveForContainer(container: Container, dependencyToken: ProviderIdentifier): unknown | null {
		const dependencyEntry = container.containerRepresentation.lookupDependencyEntry(dependencyToken);

		if (!dependencyEntry) {
			return null;
		}

		return container.resolveLocalDependency(dependencyToken);
	}

	private recursiveContainerTraversal(container: Container, dependencyToken: ProviderIdentifier): unknown | null {
		const currentContainerResolvedProvider = this.resolveForContainer(container, dependencyToken);

		if (currentContainerResolvedProvider) {
			return currentContainerResolvedProvider;
		}

		if (!container.parentContainer) {
			return null;
		}

		return this.recursiveContainerTraversal(container.parentContainer, dependencyToken);
	}
}
