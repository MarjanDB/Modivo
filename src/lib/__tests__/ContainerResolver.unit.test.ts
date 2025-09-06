import { Container } from "@lib/lib/Container/Container.js";
import { ContainerRepresentation } from "@lib/lib/Container/ContainerRepresentation.js";
import { ContainerResolver } from "@lib/lib/Container/ContainerResolver.js";
import { DependencyConstructionMethodValue } from "@lib/lib/DependencyRepresentation/DependencyConstructionMethod.js";
import { DependencyEntry } from "@lib/lib/DependencyRepresentation/DependencyEntry.js";
import {
	DependencyTokenSymbolDefinition,
	type DependencyTokenType,
} from "@lib/lib/DependencyRepresentation/DependencyTokenDefinition.js";
import { DependencyScope } from "@lib/lib/enums/DependencyScope.js";

describe("ContainerResolver", () => {
	it("should resolve a value dependency", () => {
		const containerRepresentation = new ContainerRepresentation();

		const containerResolver = new ContainerResolver(new Container(containerRepresentation));

		const dependencyToken = new DependencyTokenSymbolDefinition(Symbol.for("dependency") as DependencyTokenType);

		const dependencyEntry = new DependencyEntry(
			dependencyToken,
			new DependencyConstructionMethodValue(1),
			DependencyScope.SINGLETON,
			[],
		);
		containerRepresentation.registerDependency(dependencyEntry);

		const resolvedDependency = containerResolver.resolveDependency(dependencyToken);
		expect(resolvedDependency).toBe(1);
	});
});
