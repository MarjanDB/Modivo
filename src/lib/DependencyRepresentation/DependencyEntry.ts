import type { DependencyConstructionMethod } from "@lib/lib/DependencyRepresentation/DependencyConstructionMethod.js";
import type { DependencyTokenDefinition } from "@lib/lib/DependencyRepresentation/DependencyTokenDefinition.js";
import type { DependencyScope } from "@lib/lib/enums/DependencyScope.js";

export class DependencyEntry<FactoryArguments extends unknown[]> {
	public constructor(
		public readonly token: DependencyTokenDefinition,
		public readonly constructionMethod: DependencyConstructionMethod<FactoryArguments>,
		public readonly scope: DependencyScope,
		public readonly dependencies: DependencyTokenDefinition[],
	) {}
}
