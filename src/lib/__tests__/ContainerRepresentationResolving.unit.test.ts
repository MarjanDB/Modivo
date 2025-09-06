import { ContainerRepresentation } from "@lib/lib/Container/ContainerRepresentation.js";
import { DependencyConstructionMethodValue } from "@lib/lib/DependencyRepresentation/DependencyConstructionMethod.js";
import { DependencyEntry } from "@lib/lib/DependencyRepresentation/DependencyEntry.js";
import {
	DependencyTokenSymbolDefinition,
	type DependencyTokenType,
} from "@lib/lib/DependencyRepresentation/DependencyTokenDefinition.js";
import { DependencyScope } from "@lib/lib/enums/DependencyScope.js";

describe("ContainerRepresentationResolving", () => {
	it("should resolve a value dependency", () => {
		const containerEntry = new ContainerRepresentation();

		const dependencyToken = new DependencyTokenSymbolDefinition(Symbol.for("dependency") as DependencyTokenType);

		const dependencyEntry = new DependencyEntry(
			dependencyToken,
			new DependencyConstructionMethodValue(1),
			DependencyScope.SINGLETON,
			[],
		);
		containerEntry.registerDependency(dependencyEntry);

		const resolvedDependency = containerEntry.resolveDependencyConstructorMethod(dependencyToken);
		expect(resolvedDependency).toBeInstanceOf(DependencyConstructionMethodValue);
	});
});
