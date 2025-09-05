import type { DependencyConstructionMethod } from "@lib/lib/DependencyRepresentation/DependencyConstructionMethod.js";
import type { DependencyTokenDefinition } from "@lib/lib/DependencyRepresentation/DependencyTokenDefinition.js";
import type { DependencyScope } from "@lib/lib/enums/DependencyScope.js";

export class DependencyEntry {
	public constructor(
		public readonly token: DependencyTokenDefinition,
		public readonly constructionMethod: DependencyConstructionMethod,
		public readonly scope: DependencyScope,
	) {}
}
