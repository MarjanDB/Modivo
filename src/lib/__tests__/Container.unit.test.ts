import { Container } from "@lib/lib/Container/Container.js";
import { ContainerRepresentation } from "@lib/lib/Container/ContainerRepresentation.js";
import {
	DependencyConstructionMethodClass,
	DependencyConstructionMethodValue,
} from "@lib/lib/DependencyRepresentation/DependencyConstructionMethod.js";
import { DependencyEntry } from "@lib/lib/DependencyRepresentation/DependencyEntry.js";
import {
	DependencyTokenSymbolDefinition,
	type DependencyTokenType,
} from "@lib/lib/DependencyRepresentation/DependencyTokenDefinition.js";
import { DependencyScope } from "@lib/lib/enums/DependencyScope.js";

describe("Container", () => {
	it("should resolve a value dependency", () => {
		const containerRepresentation = new ContainerRepresentation();

		const dependencyToken = new DependencyTokenSymbolDefinition(Symbol.for("dependency") as DependencyTokenType);
		const dependencyEntry = new DependencyEntry(
			dependencyToken,
			new DependencyConstructionMethodValue(1),
			DependencyScope.SINGLETON,
		);
		containerRepresentation.registerDependency(dependencyEntry);

		const container = new Container(containerRepresentation);

		const resolvedDependency = container.resolveDependency(dependencyToken);
		expect(resolvedDependency).toBe(1);
	});

	it("should resolve a class dependency and return the same instance on multiple calls", () => {
		const containerRepresentation = new ContainerRepresentation();

		const classType = class TestClass {};

		const dependencyToken = new DependencyTokenSymbolDefinition(Symbol.for("dependency") as DependencyTokenType);
		const dependencyEntry = new DependencyEntry(
			dependencyToken,
			new DependencyConstructionMethodClass(classType),
			DependencyScope.SINGLETON,
		);
		containerRepresentation.registerDependency(dependencyEntry);

		const container = new Container(containerRepresentation);

		const resolvedDependency1 = container.resolveDependency(dependencyToken);
		expect(resolvedDependency1).toBeInstanceOf(classType);

		const resolvedDependency2 = container.resolveDependency(dependencyToken);
		expect(resolvedDependency2).toBe(resolvedDependency1);
	});
});
