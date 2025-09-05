import type { ContainerRepresentation } from "@lib/lib/Container/ContainerRepresentation.js";
import {
	DependencyConstructionMethodAsyncFactory,
	DependencyConstructionMethodClass,
	DependencyConstructionMethodFactory,
	DependencyConstructionMethodValue,
} from "@lib/lib/DependencyRepresentation/DependencyConstructionMethod.js";
import type { DependencyTokenDefinition } from "@lib/lib/DependencyRepresentation/DependencyTokenDefinition.js";

export class ContainerResolver {
	public constructor(public readonly containerRepresentation: ContainerRepresentation) {}

	public resolveDependency(dependencyToken: DependencyTokenDefinition): unknown {
		const dependencyConstructorMethod =
			this.containerRepresentation.resolveDependencyConstructorMethod(dependencyToken);

		if (!dependencyConstructorMethod) {
			throw new Error(`Dependency ${dependencyToken} not found`);
		}

		if (dependencyConstructorMethod instanceof DependencyConstructionMethodValue) {
			return dependencyConstructorMethod.value;
		}

		if (dependencyConstructorMethod instanceof DependencyConstructionMethodFactory) {
			return dependencyConstructorMethod.factory();
		}

		if (dependencyConstructorMethod instanceof DependencyConstructionMethodAsyncFactory) {
			throw new Error("Async factory dependencies are not supported in sync mode");
		}

		if (dependencyConstructorMethod instanceof DependencyConstructionMethodClass) {
			return new dependencyConstructorMethod.classType();
		}

		return dependencyConstructorMethod;
	}

	public async resolveDependencyAsync(dependencyToken: DependencyTokenDefinition): Promise<unknown> {
		const dependencyConstructorMethod =
			this.containerRepresentation.resolveDependencyConstructorMethod(dependencyToken);

		if (!dependencyConstructorMethod) {
			throw new Error(`Dependency ${dependencyToken} not found`);
		}

		if (dependencyConstructorMethod instanceof DependencyConstructionMethodAsyncFactory) {
			return await dependencyConstructorMethod.factory();
		}

		if (dependencyConstructorMethod instanceof DependencyConstructionMethodValue) {
			return dependencyConstructorMethod.value;
		}

		if (dependencyConstructorMethod instanceof DependencyConstructionMethodFactory) {
			return dependencyConstructorMethod.factory();
		}

		if (dependencyConstructorMethod instanceof DependencyConstructionMethodClass) {
			return new dependencyConstructorMethod.classType();
		}

		return dependencyConstructorMethod;
	}
}
