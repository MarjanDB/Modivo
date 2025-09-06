import { Container } from "@lib/lib/Container/Container.js";
import { ContainerRepresentation } from "@lib/lib/Container/ContainerRepresentation.js";
import {
	DependencyConstructionMethodClass,
	DependencyConstructionMethodFactory,
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
			[],
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
			[],
		);
		containerRepresentation.registerDependency(dependencyEntry);

		const container = new Container(containerRepresentation);

		const resolvedDependency1 = container.resolveDependency(dependencyToken);
		expect(resolvedDependency1).toBeInstanceOf(classType);

		const resolvedDependency2 = container.resolveDependency(dependencyToken);
		expect(resolvedDependency2).toBe(resolvedDependency1);
	});

	it("should resolve a factory dependency with dependencies", () => {
		const containerRepresentation = new ContainerRepresentation();

		const dependencyToken1 = new DependencyTokenSymbolDefinition(Symbol.for("dependency1") as DependencyTokenType);
		const dependencyToken2 = new DependencyTokenSymbolDefinition(Symbol.for("dependency2") as DependencyTokenType);

		const dependencyEntry1 = new DependencyEntry(
			dependencyToken1,
			new DependencyConstructionMethodValue(1),
			DependencyScope.SINGLETON,
			[],
		);

		const dependencyEntry2 = new DependencyEntry(
			dependencyToken2,
			new DependencyConstructionMethodValue(2),
			DependencyScope.SINGLETON,
			[],
		);

		const dependencyToken = new DependencyTokenSymbolDefinition(Symbol.for("dependency") as DependencyTokenType);
		const dependencyEntry = new DependencyEntry(
			dependencyToken,
			new DependencyConstructionMethodFactory((dependency1: number, dependency2: number): number => {
				return dependency1 + dependency2;
			}),
			DependencyScope.SINGLETON,
			[dependencyToken1, dependencyToken2],
		);

		containerRepresentation.registerDependency(dependencyEntry1);
		containerRepresentation.registerDependency(dependencyEntry2);
		containerRepresentation.registerDependency(dependencyEntry);

		const container = new Container(containerRepresentation);

		const resolvedDependency = container.resolveDependency(dependencyToken);
		expect(resolvedDependency).toBe(3);
	});
});
