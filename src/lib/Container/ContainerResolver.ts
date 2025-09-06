import type { Container } from "@lib/lib/Container/Container.js";
import {
	DependencyConstructionMethodAsyncFactory,
	DependencyConstructionMethodClass,
	DependencyConstructionMethodFactory,
	DependencyConstructionMethodValue,
} from "@lib/lib/DependencyRepresentation/DependencyConstructionMethod.js";
import type { DependencyEntry } from "@lib/lib/DependencyRepresentation/DependencyEntry.js";
import type { DependencyTokenDefinition } from "@lib/lib/DependencyRepresentation/DependencyTokenDefinition.js";

export class ContainerResolver {
	public constructor(public readonly container: Container) {}

	private resolveValueDependency(dependencyConstructorMethod: DependencyConstructionMethodValue): unknown {
		return dependencyConstructorMethod.value;
	}

	private resolveFactoryDependency(
		dependencyConstructorMethod: DependencyConstructionMethodFactory,
		dependencyEntry: DependencyEntry,
	): unknown {
		const resolvedDependencies = dependencyEntry.dependencies.map((dependencyToken) => {
			return this.resolveDependency(dependencyToken);
		});

		return dependencyConstructorMethod.factory(...resolvedDependencies);
	}

	private resolveClassDependency(dependencyConstructorMethod: DependencyConstructionMethodClass): unknown {
		return new dependencyConstructorMethod.classType();
	}

	private resolveAsyncFactoryDependency(
		dependencyConstructorMethod: DependencyConstructionMethodAsyncFactory,
		dependencyEntry: DependencyEntry,
	): Promise<unknown> {
		const resolvedDependencies = dependencyEntry.dependencies.map((dependencyToken) => {
			return this.resolveDependency(dependencyToken);
		});

		return dependencyConstructorMethod.factory(...resolvedDependencies);
	}

	public resolveDependency(dependencyToken: DependencyTokenDefinition): unknown {
		const dependencyEntry = this.container.containerRepresentation.lookupDependencyEntry(dependencyToken);

		if (!dependencyEntry) {
			throw new Error(`Dependency ${dependencyToken} not found`);
		}

		const dependencyConstructorMethod = dependencyEntry.constructionMethod;

		if (dependencyConstructorMethod instanceof DependencyConstructionMethodValue) {
			return this.resolveValueDependency(dependencyConstructorMethod);
		}

		if (dependencyConstructorMethod instanceof DependencyConstructionMethodFactory) {
			return this.resolveFactoryDependency(dependencyConstructorMethod, dependencyEntry);
		}

		if (dependencyConstructorMethod instanceof DependencyConstructionMethodAsyncFactory) {
			throw new Error("Async factory dependencies are not supported in sync mode");
		}

		if (dependencyConstructorMethod instanceof DependencyConstructionMethodClass) {
			return this.resolveClassDependency(dependencyConstructorMethod);
		}

		return dependencyConstructorMethod;
	}

	public async resolveDependencyAsync(dependencyToken: DependencyTokenDefinition): Promise<unknown> {
		const dependencyEntry = this.container.containerRepresentation.lookupDependencyEntry(dependencyToken);

		if (!dependencyEntry) {
			throw new Error(`Dependency ${dependencyToken} not found`);
		}

		const dependencyConstructorMethod = dependencyEntry.constructionMethod;

		if (dependencyConstructorMethod instanceof DependencyConstructionMethodAsyncFactory) {
			return await this.resolveAsyncFactoryDependency(dependencyConstructorMethod, dependencyEntry);
		}

		if (dependencyConstructorMethod instanceof DependencyConstructionMethodValue) {
			return this.resolveValueDependency(dependencyConstructorMethod);
		}

		if (dependencyConstructorMethod instanceof DependencyConstructionMethodFactory) {
			return this.resolveFactoryDependency(dependencyConstructorMethod, dependencyEntry);
		}

		if (dependencyConstructorMethod instanceof DependencyConstructionMethodClass) {
			return this.resolveClassDependency(dependencyConstructorMethod);
		}

		return dependencyConstructorMethod;
	}
}
