import { ContainerRepresentation } from "@lib/lib/Container/ContainerRepresentation.js";
import { ProviderScope } from "@lib/lib/enums/ProviderScope.js";
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
			ProviderScope.SINGLETON,
		);
		containerEntry.registerDependency(dependencyEntry);

		const resolvedDependency = containerEntry.lookupDependencyEntry(dependencyToken);
		expect(resolvedDependency?.constructionMethod).toBeInstanceOf(ProviderConstructionMethodForValue);
	});
});
