import { ContainerRepresentation } from "@lib/lib/ContainerRepresentation/ContainerRepresentation.js";
import { ProviderConstructionMethodForValue } from "@lib/lib/ProviderRepresentation/ProviderConstructionMethod.js";
import { ProviderDefinitionForValue } from "@lib/lib/ProviderRepresentation/ProviderDefinition.js";
import {
	type DependencyTokenType,
	ProviderIdentifierAsSymbol,
} from "@lib/lib/ProviderRepresentation/ProviderIdentifierDefinition.js";
import { ProviderScope } from "@lib/lib/ProviderRepresentation/ProviderScope.js";

describe("ContainerRepresentation", () => {
	it("should resolve a value dependency", () => {
		const containerEntry = new ContainerRepresentation();

		const dependencyToken = new ProviderIdentifierAsSymbol(Symbol.for("dependency") as DependencyTokenType);

		const dependencyEntry = new ProviderDefinitionForValue(
			dependencyToken,
			new ProviderConstructionMethodForValue(1),
			ProviderScope.SINGLETON,
		);
		containerEntry.registerProvider(dependencyEntry);

		const resolvedDependency = containerEntry.lookupProviderEntry(dependencyToken);
		expect(resolvedDependency?.constructionMethod).toBeInstanceOf(ProviderConstructionMethodForValue);
	});
});
