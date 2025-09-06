import type { DependencyConstructionMethod } from "@lib/lib/DependencyRepresentation/DependencyConstructionMethod.js";
import type { DependencyEntry } from "@lib/lib/DependencyRepresentation/DependencyEntry.js";
import type { DependencyTokenDefinition } from "@lib/lib/DependencyRepresentation/DependencyTokenDefinition.js";
import { DependencyScope } from "@lib/lib/enums/DependencyScope.js";

export class ContainerRepresentation {
	private readonly mapOfDependencyTokenToDependencyEntry: Map<DependencyTokenDefinition, DependencyEntry<unknown[]>> =
		new Map();

	private readonly resolvedValuesForSingletonDependencies: Map<
		DependencyTokenDefinition,
		DependencyConstructionMethod
	> = new Map();

	private readonly resolversForTransientDependencies: Map<DependencyTokenDefinition, DependencyConstructionMethod> =
		new Map();

	public registerDependency(dependencyEntry: DependencyEntry): void {
		this.mapOfDependencyTokenToDependencyEntry.set(dependencyEntry.token, dependencyEntry);

		if (dependencyEntry.scope === DependencyScope.SINGLETON) {
			this.resolvedValuesForSingletonDependencies.set(dependencyEntry.token, dependencyEntry.constructionMethod);
			return;
		}

		if (dependencyEntry.scope === DependencyScope.TRANSIENT) {
			this.resolversForTransientDependencies.set(dependencyEntry.token, dependencyEntry.constructionMethod);
			return;
		}
	}

	public lookupDependencyEntry(dependencyToken: DependencyTokenDefinition): DependencyEntry | null {
		return this.mapOfDependencyTokenToDependencyEntry.get(dependencyToken) ?? null;
	}

	public resolveDependencyConstructorMethod(
		dependencyToken: DependencyTokenDefinition,
	): DependencyConstructionMethod | null {
		const resolvedDependencyEntry = this.mapOfDependencyTokenToDependencyEntry.get(dependencyToken);

		if (!resolvedDependencyEntry) {
			return null;
		}

		const dependencyScope = resolvedDependencyEntry.scope;

		if (dependencyScope === DependencyScope.SINGLETON) {
			return this.resolvedValuesForSingletonDependencies.get(dependencyToken) ?? null;
		}

		if (dependencyScope === DependencyScope.TRANSIENT) {
			return this.resolversForTransientDependencies.get(dependencyToken) ?? null;
		}

		throw new Error(`Dependency ${dependencyToken} has an invalid scope`);
	}
}
