import type { Container } from "@lib/lib/Container/Container.js";
import { ProviderConstructionMethodForAsyncFactory } from "@lib/lib/ProviderRepresentation/ProviderConstructionMethod.js";
import {
	ProviderDefinitionForAsyncFunction,
	ProviderDefinitionForClass,
	ProviderDefinitionForFunction,
	ProviderDefinitionForValue,
} from "@lib/lib/ProviderRepresentation/ProviderDefinition.js";
import type { ProviderIdentifier } from "@lib/lib/ProviderRepresentation/ProviderIdentifierDefinition.js";

export class ContainerResolver {
	public constructor(public readonly container: Container) {}

	private resolveValueDependency(providerDefinition: ProviderDefinitionForValue): unknown {
		return providerDefinition.constructionMethod.value;
	}

	private resolveFactoryDependency(providerDefinition: ProviderDefinitionForFunction): unknown {
		const sortedDependencies = [...providerDefinition.dependencies].sort(
			(a, b) => a.parameterIndex - b.parameterIndex,
		);

		const resolvedDependencies = sortedDependencies.map((dependencyToken) => {
			return this.container.resolveDependency(dependencyToken.dependencyToken);
		});

		return providerDefinition.constructionMethod.factory(...resolvedDependencies);
	}

	private resolveClassDependency(providerDefinition: ProviderDefinitionForClass): unknown {
		const sortedDependencies = [...providerDefinition.dependencies].sort(
			(a, b) => a.parameterIndex - b.parameterIndex,
		);

		const resolvedDependencies = sortedDependencies.map((dependencyToken) => {
			return this.container.resolveDependency(dependencyToken.dependencyToken);
		});

		return new providerDefinition.constructionMethod.classType(...resolvedDependencies);
	}

	private resolveAsyncFactoryDependency(providerDefinition: ProviderDefinitionForAsyncFunction): Promise<unknown> {
		const sortedDependencies = [...providerDefinition.dependencies].sort(
			(a, b) => a.parameterIndex - b.parameterIndex,
		);

		const resolvedDependencies = sortedDependencies.map((dependencyToken) => {
			return this.container.resolveDependency(dependencyToken.dependencyToken);
		});

		return providerDefinition.constructionMethod.factory(...resolvedDependencies);
	}

	public resolveDependency(dependencyToken: ProviderIdentifier): unknown {
		const dependencyEntry = this.container.containerRepresentation.lookupDependencyEntry(dependencyToken);

		if (!dependencyEntry) {
			throw new Error(`Dependency ${dependencyToken} not found`);
		}

		if (dependencyEntry instanceof ProviderDefinitionForClass) {
			return this.resolveClassDependency(dependencyEntry);
		}

		if (dependencyEntry instanceof ProviderDefinitionForFunction) {
			return this.resolveFactoryDependency(dependencyEntry);
		}

		if (dependencyEntry instanceof ProviderDefinitionForValue) {
			return this.resolveValueDependency(dependencyEntry);
		}

		if (dependencyEntry instanceof ProviderConstructionMethodForAsyncFactory) {
			throw new Error("Async factory dependencies are not supported in sync mode");
		}

		return dependencyEntry;
	}

	public async resolveDependencyAsync(dependencyToken: ProviderIdentifier): Promise<unknown> {
		const dependencyEntry = this.container.containerRepresentation.lookupDependencyEntry(dependencyToken);

		if (!dependencyEntry) {
			throw new Error(`Dependency ${dependencyToken} not found`);
		}

		if (dependencyEntry instanceof ProviderDefinitionForAsyncFunction) {
			return await this.resolveAsyncFactoryDependency(dependencyEntry);
		}

		if (dependencyEntry instanceof ProviderDefinitionForFunction) {
			return this.resolveFactoryDependency(dependencyEntry);
		}

		if (dependencyEntry instanceof ProviderDefinitionForClass) {
			return this.resolveClassDependency(dependencyEntry);
		}

		if (dependencyEntry instanceof ProviderDefinitionForValue) {
			return this.resolveValueDependency(dependencyEntry);
		}

		return dependencyEntry;
	}
}
