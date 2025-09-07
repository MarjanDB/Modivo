import type { Container } from "@lib/lib/ContainerRepresentation/Container.js";
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

	private resolveValueProvider(providerDefinition: ProviderDefinitionForValue): unknown {
		return providerDefinition.constructionMethod.value;
	}

	private resolveFactoryProvider(providerDefinition: ProviderDefinitionForFunction): unknown {
		const resolvedDependencies = providerDefinition.dependencies.map((dependencyToken) => {
			return this.container.resolveProvider(dependencyToken.dependencyToken);
		});

		return providerDefinition.constructionMethod.factory(...resolvedDependencies);
	}

	private resolveClassProvider(providerDefinition: ProviderDefinitionForClass): unknown {
		const resolvedDependencies = providerDefinition.dependencies.map((dependencyToken) => {
			return this.container.resolveProvider(dependencyToken.dependencyToken);
		});

		return new providerDefinition.constructionMethod.classType(...resolvedDependencies);
	}

	private resolveAsyncFactoryProvider(providerDefinition: ProviderDefinitionForAsyncFunction): Promise<unknown> {
		const resolvedDependencies = providerDefinition.dependencies.map((dependencyToken) => {
			return this.container.resolveProvider(dependencyToken.dependencyToken);
		});

		return providerDefinition.constructionMethod.factory(...resolvedDependencies);
	}

	public resolveProvider(dependencyToken: ProviderIdentifier): unknown {
		const dependencyEntry = this.container.containerRepresentation.lookupProviderEntry(dependencyToken);

		if (!dependencyEntry) {
			throw new Error(`Dependency ${dependencyToken} not found`);
		}

		if (dependencyEntry instanceof ProviderDefinitionForClass) {
			return this.resolveClassProvider(dependencyEntry);
		}

		if (dependencyEntry instanceof ProviderDefinitionForFunction) {
			return this.resolveFactoryProvider(dependencyEntry);
		}

		if (dependencyEntry instanceof ProviderDefinitionForValue) {
			return this.resolveValueProvider(dependencyEntry);
		}

		if (dependencyEntry instanceof ProviderConstructionMethodForAsyncFactory) {
			throw new Error("Async factory dependencies are not supported in sync mode");
		}

		return dependencyEntry;
	}

	public async resolveProviderAsync(dependencyToken: ProviderIdentifier): Promise<unknown> {
		const dependencyEntry = this.container.containerRepresentation.lookupProviderEntry(dependencyToken);

		if (!dependencyEntry) {
			throw new Error(`Dependency ${dependencyToken} not found`);
		}

		if (dependencyEntry instanceof ProviderDefinitionForAsyncFunction) {
			return await this.resolveAsyncFactoryProvider(dependencyEntry);
		}

		if (dependencyEntry instanceof ProviderDefinitionForFunction) {
			return this.resolveFactoryProvider(dependencyEntry);
		}

		if (dependencyEntry instanceof ProviderDefinitionForClass) {
			return this.resolveClassProvider(dependencyEntry);
		}

		if (dependencyEntry instanceof ProviderDefinitionForValue) {
			return this.resolveValueProvider(dependencyEntry);
		}

		return dependencyEntry;
	}
}
