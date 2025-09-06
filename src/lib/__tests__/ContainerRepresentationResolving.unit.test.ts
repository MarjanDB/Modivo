import { ContainerRepresentation } from "@lib/lib/Container/ContainerRepresentation.js";
import { DependencyScope } from "@lib/lib/enums/DependencyScope.js";
import { ProviderConstructionMethodForValue } from "@lib/lib/ProviderRepresentation/ProviderConstructionMethod.js";
import { ProviderDefinitionForValue } from "@lib/lib/ProviderRepresentation/ProviderDefinition.js";
import {
	type DependencyTokenType,
	ProviderIdentifierAsSymbol,
} from "@lib/lib/ProviderRepresentation/ProviderIdentifierDefinition.js";

describe("ContainerRepresentationResolving", () => {
	it("should resolve a value dependency", () => {
		const containerEntry = new ContainerRepresentation();

		const dependencyToken = new ProviderIdentifierAsSymbol(Symbol.for("dependency") as DependencyTokenType);

		const dependencyEntry = new ProviderDefinitionForValue(
			dependencyToken,
			new ProviderConstructionMethodForValue(1),
			DependencyScope.SINGLETON,
		);
		containerEntry.registerDependency(dependencyEntry);

		const resolvedDependency = containerEntry.lookupDependencyEntry(dependencyToken);
		expect(resolvedDependency?.constructionMethod).toBeInstanceOf(ProviderConstructionMethodForValue);
	});
});
