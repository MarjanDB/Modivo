import { Container } from "@lib/lib/ContainerRepresentation/Container.js";
import { ContainerRepresentation } from "@lib/lib/ContainerRepresentation/ContainerRepresentation.js";
import { ProviderScope } from "@lib/lib/enums/ProviderScope.js";
import {
	ProviderConstructionMethodForClass,
	ProviderConstructionMethodForFactory,
	ProviderConstructionMethodForValue,
} from "@lib/lib/ProviderRepresentation/ProviderConstructionMethod.js";
import {
	ProviderDefinitionForClass,
	ProviderDefinitionForFunction,
	ProviderDefinitionForValue,
} from "@lib/lib/ProviderRepresentation/ProviderDefinition.js";
import { ProviderDependencyForFunction } from "@lib/lib/ProviderRepresentation/ProviderDependency.js";
import {
	type DependencyTokenType,
	ProviderIdentifierAsSymbol,
} from "@lib/lib/ProviderRepresentation/ProviderIdentifierDefinition.js";

describe("Container", () => {
	describe("localResolveDependency", () => {
		it("should resolve a value dependency", () => {
			const containerRepresentation = new ContainerRepresentation();

			const dependencyToken = new ProviderIdentifierAsSymbol(Symbol.for("dependency") as DependencyTokenType);
			const dependencyEntry = new ProviderDefinitionForValue(
				dependencyToken,
				new ProviderConstructionMethodForValue(1),
				ProviderScope.SINGLETON,
			);
			containerRepresentation.registerDependency(dependencyEntry);

			const container = new Container(containerRepresentation);

			const resolvedDependency = container.resolveLocalDependency(dependencyToken);
			expect(resolvedDependency).toBe(1);
		});

		it("should be possible to override a value dependency", () => {
			const containerRepresentation = new ContainerRepresentation();

			const dependencyToken = new ProviderIdentifierAsSymbol(Symbol.for("dependency") as DependencyTokenType);
			const dependencyEntry = new ProviderDefinitionForValue(
				dependencyToken,
				new ProviderConstructionMethodForValue(1),
				ProviderScope.SINGLETON,
			);
			containerRepresentation.registerDependency(dependencyEntry);

			const dependencyEntry2 = new ProviderDefinitionForValue(
				dependencyToken,
				new ProviderConstructionMethodForValue(2),
				ProviderScope.SINGLETON,
			);
			containerRepresentation.overrideDependency(dependencyEntry2);

			const container = new Container(containerRepresentation);

			const resolvedDependency = container.resolveLocalDependency(dependencyToken);
			expect(resolvedDependency).toBe(2);
		});

		it("should resolve a class dependency and return the same instance on multiple calls", () => {
			const containerRepresentation = new ContainerRepresentation();

			const classType = class TestClass {};

			const dependencyToken = new ProviderIdentifierAsSymbol(Symbol.for("dependency") as DependencyTokenType);
			const dependencyEntry = new ProviderDefinitionForClass(
				dependencyToken,
				new ProviderConstructionMethodForClass(classType),
				ProviderScope.SINGLETON,
				[],
			);
			containerRepresentation.registerDependency(dependencyEntry);

			const container = new Container(containerRepresentation);

			const resolvedDependency1 = container.resolveLocalDependency(dependencyToken);
			expect(resolvedDependency1).toBeInstanceOf(classType);

			const resolvedDependency2 = container.resolveLocalDependency(dependencyToken);
			expect(resolvedDependency2).toBe(resolvedDependency1);
		});

		it("should resolve class dependency with dependencies in correct order", () => {
			const containerRepresentation = new ContainerRepresentation();

			const classType = class TestClass {
				public constructor(
					public readonly dependency1: number,
					public readonly dependency2: number,
				) {}
			};

			const providerToken = new ProviderIdentifierAsSymbol(Symbol.for("dependency") as DependencyTokenType);

			const dependencyToken1 = new ProviderIdentifierAsSymbol(Symbol.for("dependency1") as DependencyTokenType);
			const dependencyEntry1 = new ProviderDefinitionForValue(
				dependencyToken1,
				new ProviderConstructionMethodForValue(1),
				ProviderScope.SINGLETON,
			);

			const dependencyToken2 = new ProviderIdentifierAsSymbol(Symbol.for("dependency2") as DependencyTokenType);
			const dependencyEntry2 = new ProviderDefinitionForValue(
				dependencyToken2,
				new ProviderConstructionMethodForValue(2),
				ProviderScope.SINGLETON,
			);

			const dependencyEntry = new ProviderDefinitionForClass(
				providerToken,
				new ProviderConstructionMethodForClass(classType),
				ProviderScope.SINGLETON,
				[
					new ProviderDependencyForFunction(0, dependencyToken1),
					new ProviderDependencyForFunction(1, dependencyToken2),
				],
			);

			containerRepresentation.registerDependency(dependencyEntry1);
			containerRepresentation.registerDependency(dependencyEntry2);
			containerRepresentation.registerDependency(dependencyEntry);

			const container = new Container(containerRepresentation);

			const resolvedDependency1 = container.resolveLocalDependency(providerToken);
			expect(resolvedDependency1).toBeInstanceOf(classType);

			expect((resolvedDependency1 as InstanceType<typeof classType>).dependency1).toBe(1);
			expect((resolvedDependency1 as InstanceType<typeof classType>).dependency2).toBe(2);
		});

		it("should resolve a factory dependency with dependencies in correct order", () => {
			const containerRepresentation = new ContainerRepresentation();

			const dependencyToken1 = new ProviderIdentifierAsSymbol(Symbol.for("dependency1") as DependencyTokenType);
			const dependencyToken2 = new ProviderIdentifierAsSymbol(Symbol.for("dependency2") as DependencyTokenType);

			const dependencyEntry1 = new ProviderDefinitionForValue(
				dependencyToken1,
				new ProviderConstructionMethodForValue(1),
				ProviderScope.SINGLETON,
			);

			const dependencyEntry2 = new ProviderDefinitionForValue(
				dependencyToken2,
				new ProviderConstructionMethodForValue(2),
				ProviderScope.SINGLETON,
			);

			const dependencyToken = new ProviderIdentifierAsSymbol(Symbol.for("dependency") as DependencyTokenType);
			const dependencyEntry = new ProviderDefinitionForFunction(
				dependencyToken,
				new ProviderConstructionMethodForFactory((dependency1: number, dependency2: number): number => {
					return dependency1 / dependency2;
				}),
				ProviderScope.SINGLETON,
				[
					new ProviderDependencyForFunction(0, dependencyToken1),
					new ProviderDependencyForFunction(1, dependencyToken2),
				],
			);

			containerRepresentation.registerDependency(dependencyEntry1);
			containerRepresentation.registerDependency(dependencyEntry2);
			containerRepresentation.registerDependency(dependencyEntry);

			const container = new Container(containerRepresentation);

			const resolvedDependency = container.resolveLocalDependency(dependencyToken);
			expect(resolvedDependency).toBe(0.5);
		});
	});

	describe("resolveDependency", () => {
		it("should resolve a dependency from the current container", () => {
			const containerRepresentation = new ContainerRepresentation();

			const dependencyToken = new ProviderIdentifierAsSymbol(Symbol.for("dependency") as DependencyTokenType);
			const dependencyEntry = new ProviderDefinitionForValue(
				dependencyToken,
				new ProviderConstructionMethodForValue(1),
				ProviderScope.SINGLETON,
			);
			containerRepresentation.registerDependency(dependencyEntry);

			const container = new Container(containerRepresentation);

			const resolvedDependency = container.resolveDependency(dependencyToken);
			expect(resolvedDependency).toBe(1);
		});

		it("should resolve a dependency from the parent container", () => {
			const parentRepresentation = new ContainerRepresentation();

			const parentDependencyToken = new ProviderIdentifierAsSymbol(
				Symbol.for("dependency") as DependencyTokenType,
			);
			const parentDependencyEntry = new ProviderDefinitionForValue(
				parentDependencyToken,
				new ProviderConstructionMethodForValue(1),
				ProviderScope.SINGLETON,
			);
			parentRepresentation.registerDependency(parentDependencyEntry);
			const parentContainer = new Container(parentRepresentation);

			const childRepresentation = new ContainerRepresentation();
			const childContainer = new Container(childRepresentation, parentContainer);

			const resolvedDependency = childContainer.resolveDependency(parentDependencyToken);
			expect(resolvedDependency).toBe(1);
		});

		it("should resolve a dependency that is from a provider in the parent container", () => {
			const parentRepresentation = new ContainerRepresentation();

			const parentDependencyToken = new ProviderIdentifierAsSymbol(
				Symbol.for("dependency") as DependencyTokenType,
			);
			const parentDependencyEntry = new ProviderDefinitionForValue(
				parentDependencyToken,
				new ProviderConstructionMethodForValue(1),
				ProviderScope.SINGLETON,
			);
			parentRepresentation.registerDependency(parentDependencyEntry);
			const parentContainer = new Container(parentRepresentation);

			const childRepresentation = new ContainerRepresentation();
			const childDependencyToken = new ProviderIdentifierAsSymbol(
				Symbol.for("dependency") as DependencyTokenType,
			);
			const childDependencyEntry = new ProviderDefinitionForFunction(
				childDependencyToken,
				new ProviderConstructionMethodForFactory((dependency1: number): number => {
					return dependency1;
				}),
				ProviderScope.SINGLETON,
				[new ProviderDependencyForFunction(0, parentDependencyToken)],
			);
			childRepresentation.registerDependency(childDependencyEntry);
			const childContainer = new Container(childRepresentation, parentContainer);

			const resolvedDependency = childContainer.resolveDependency(childDependencyToken);
			expect(resolvedDependency).toBe(1);
		});
	});
});
