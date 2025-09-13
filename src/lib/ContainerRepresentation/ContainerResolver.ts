import type { Container } from "@lib/lib/ContainerRepresentation/Container.js";
import { ProviderConstructionMethodForAsyncFactory } from "@lib/lib/ProviderRepresentation/ProviderConstructionMethod.js";
import {
	ProviderDefinitionForAsyncFunction,
	ProviderDefinitionForClass,
	ProviderDefinitionForFunction,
	ProviderDefinitionForValue,
} from "@lib/lib/ProviderRepresentation/ProviderDefinition.js";
import type { ProviderIdentifier } from "@lib/lib/ProviderRepresentation/ProviderIdentifierDefinition.js";
import {
	isProviderOnResolvedAsync,
	isProviderOnResolvedSync,
} from "@lib/lib/ProviderRepresentation/ProviderLifecycles.js";

export class ContainerResolver {
	public constructor(public readonly container: Container) {}

	private resolveValueProvider(providerDefinition: ProviderDefinitionForValue): unknown {
		const instance = providerDefinition.constructionMethod.value;

		// Only one should realistically be implemented, defining both is probably a mistake
		if (isProviderOnResolvedSync(instance) && isProviderOnResolvedAsync(instance)) {
			throw new Error(
				"Provider on resolved and provider on resolved sync are both implemented. Only one should be implemented.",
			);
		}

		if (isProviderOnResolvedAsync(instance)) {
			// TODO: This has to be awaited
			instance.$afterResolvedAsync();
		}

		if (isProviderOnResolvedSync(instance)) {
			instance.$afterResolvedSync();
		}

		return instance;
	}

	private resolveFactoryProvider(providerDefinition: ProviderDefinitionForFunction): unknown {
		const resolvedDependencies = providerDefinition.dependencies.map((dependencyToken) => {
			return this.container.resolveProvider(dependencyToken.dependencyToken);
		});

		const instance = providerDefinition.constructionMethod.factory(...resolvedDependencies);

		// Only one should realistically be implemented, defining both is probably a mistake
		if (isProviderOnResolvedSync(instance) && isProviderOnResolvedAsync(instance)) {
			throw new Error(
				"Provider on resolved and provider on resolved sync are both implemented. Only one should be implemented.",
			);
		}

		if (isProviderOnResolvedAsync(instance)) {
			// TODO: This has to be awaited
			instance.$afterResolvedAsync();
		}

		if (isProviderOnResolvedSync(instance)) {
			instance.$afterResolvedSync();
		}

		return instance;
	}

	private resolveClassProvider(providerDefinition: ProviderDefinitionForClass): unknown {
		const resolvedDependencies = providerDefinition.dependencies.map((dependencyToken) => {
			return this.container.resolveProvider(dependencyToken.dependencyToken);
		});

		const instance = new providerDefinition.constructionMethod.classType(...resolvedDependencies);

		// Only one should realistically be implemented, defining both is probably a mistake
		if (isProviderOnResolvedSync(instance) && isProviderOnResolvedAsync(instance)) {
			throw new Error(
				"Provider on resolved and provider on resolved sync are both implemented. Only one should be implemented.",
			);
		}

		if (isProviderOnResolvedAsync(instance)) {
			// TODO: This has to be awaited
			instance.$afterResolvedAsync();
		}

		if (isProviderOnResolvedSync(instance)) {
			instance.$afterResolvedSync();
		}

		return instance;
	}

	private async resolveAsyncFactoryProvider(
		providerDefinition: ProviderDefinitionForAsyncFunction,
	): Promise<unknown> {
		const resolvedDependencies = providerDefinition.dependencies.map((dependencyToken) => {
			return this.container.resolveProvider(dependencyToken.dependencyToken);
		});

		const instance = await providerDefinition.constructionMethod.factory(...resolvedDependencies);

		// Only one should realistically be implemented, defining both is probably a mistake
		if (isProviderOnResolvedSync(instance) && isProviderOnResolvedAsync(instance)) {
			throw new Error(
				"Provider on resolved and provider on resolved sync are both implemented. Only one should be implemented.",
			);
		}

		if (isProviderOnResolvedAsync(instance)) {
			await instance.$afterResolvedAsync();
		}

		if (isProviderOnResolvedSync(instance)) {
			instance.$afterResolvedSync();
		}

		return instance;
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
			return this.resolveAsyncFactoryProvider(dependencyEntry);
		}

		if (dependencyEntry instanceof ProviderDefinitionForFunction) {
			return Promise.resolve(this.resolveFactoryProvider(dependencyEntry));
		}

		if (dependencyEntry instanceof ProviderDefinitionForClass) {
			return Promise.resolve(this.resolveClassProvider(dependencyEntry));
		}

		if (dependencyEntry instanceof ProviderDefinitionForValue) {
			return Promise.resolve(this.resolveValueProvider(dependencyEntry));
		}

		return dependencyEntry;
	}
}
