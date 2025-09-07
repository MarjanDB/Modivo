import { Container } from "@lib/lib/ContainerRepresentation/Container.js";
import { ContainerRepresentation } from "@lib/lib/ContainerRepresentation/ContainerRepresentation.js";
import { ContainerResolver } from "@lib/lib/ContainerRepresentation/ContainerResolver.js";
import { ProviderScope } from "@lib/lib/enums/ProviderScope.js";
import { ProviderConstructionMethodForValue } from "@lib/lib/ProviderRepresentation/ProviderConstructionMethod.js";
import { ProviderDefinitionForValue } from "@lib/lib/ProviderRepresentation/ProviderDefinition.js";
import {
	type DependencyTokenType,
	ProviderIdentifierAsSymbol,
} from "@lib/lib/ProviderRepresentation/ProviderIdentifierDefinition.js";

describe("ContainerResolver", () => {
	it("should resolve a value dependency", () => {
		const containerRepresentation = new ContainerRepresentation();

		const containerResolver = new ContainerResolver(new Container(containerRepresentation));

		const dependencyToken = new ProviderIdentifierAsSymbol(Symbol.for("dependency") as DependencyTokenType);

		const dependencyEntry = new ProviderDefinitionForValue(
			dependencyToken,
			new ProviderConstructionMethodForValue(1),
			ProviderScope.SINGLETON,
		);
		containerRepresentation.registerProvider(dependencyEntry);

		const resolvedDependency = containerResolver.resolveProvider(dependencyToken);
		expect(resolvedDependency).toBe(1);
	});
});
