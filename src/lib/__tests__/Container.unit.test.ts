import { Container } from "@lib/lib/ContainerRepresentation/Container.js";
import { ContainerRepresentation } from "@lib/lib/ContainerRepresentation/ContainerRepresentation.js";
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
import { ProviderScope } from "@lib/lib/ProviderRepresentation/ProviderScope.js";
import { ProviderTicketMaster } from "@lib/lib/UsageImplementation/ProviderTicketMaster.js";

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
			containerRepresentation.registerProvider(dependencyEntry);

			const container = new Container(containerRepresentation);

			const resolvedDependency = container.resolveLocalProvider(dependencyToken);
			expect(resolvedDependency).toBe(1);
		});

		it("should resolve a value dependency using a ticket and utilize typescript for type inference", () => {
			const containerRepresentation = new ContainerRepresentation();

			const dependencyIdentifier = Symbol.for("dependency") as DependencyTokenType;
			const value = { example: "value" };

			const dependencyTicket = ProviderTicketMaster.createTicket({
				identifier: dependencyIdentifier,
				value: value,
			});
			const dependencyEntry = new ProviderDefinitionForValue(
				dependencyTicket.token,
				new ProviderConstructionMethodForValue(value),
				ProviderScope.SINGLETON,
			);
			containerRepresentation.registerProvider(dependencyEntry);

			const container = new Container(containerRepresentation);

			const resolvedDependency: { example: string } = container.resolveLocalProvider(dependencyTicket);
			expect(resolvedDependency).toBe(value);
		});

		it("should be possible to override a value dependency", () => {
			const containerRepresentation = new ContainerRepresentation();

			const dependencyToken = new ProviderIdentifierAsSymbol(Symbol.for("dependency") as DependencyTokenType);
			const dependencyEntry = new ProviderDefinitionForValue(
				dependencyToken,
				new ProviderConstructionMethodForValue(1),
				ProviderScope.SINGLETON,
			);
			containerRepresentation.registerProvider(dependencyEntry);

			const dependencyEntry2 = new ProviderDefinitionForValue(
				dependencyToken,
				new ProviderConstructionMethodForValue(2),
				ProviderScope.SINGLETON,
			);
			containerRepresentation.overrideProvider(dependencyEntry2);

			const container = new Container(containerRepresentation);

			const resolvedDependency = container.resolveLocalProvider(dependencyToken);
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
			containerRepresentation.registerProvider(dependencyEntry);

			const container = new Container(containerRepresentation);

			const resolvedDependency1 = container.resolveLocalProvider(dependencyToken);
			expect(resolvedDependency1).toBeInstanceOf(classType);

			const resolvedDependency2 = container.resolveLocalProvider(dependencyToken);
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
					new ProviderDependencyForFunction(dependencyToken1),
					new ProviderDependencyForFunction(dependencyToken2),
				],
			);

			containerRepresentation.registerProvider(dependencyEntry1);
			containerRepresentation.registerProvider(dependencyEntry2);
			containerRepresentation.registerProvider(dependencyEntry);

			const container = new Container(containerRepresentation);

			const resolvedDependency1 = container.resolveLocalProvider(providerToken);
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
					new ProviderDependencyForFunction(dependencyToken1),
					new ProviderDependencyForFunction(dependencyToken2),
				],
			);

			containerRepresentation.registerProvider(dependencyEntry1);
			containerRepresentation.registerProvider(dependencyEntry2);
			containerRepresentation.registerProvider(dependencyEntry);

			const container = new Container(containerRepresentation);

			const resolvedDependency = container.resolveLocalProvider(dependencyToken);
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
			containerRepresentation.registerProvider(dependencyEntry);

			const container = new Container(containerRepresentation);

			const resolvedDependency = container.resolveProvider(dependencyToken);
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
			parentRepresentation.registerProvider(parentDependencyEntry);
			const parentContainer = new Container(parentRepresentation);

			const childRepresentation = new ContainerRepresentation();
			const childContainer = new Container(childRepresentation, parentContainer);

			const resolvedDependency = childContainer.resolveProvider(parentDependencyToken);
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
			parentRepresentation.registerProvider(parentDependencyEntry);
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
				[new ProviderDependencyForFunction(parentDependencyToken)],
			);
			childRepresentation.registerProvider(childDependencyEntry);
			const childContainer = new Container(childRepresentation, parentContainer);

			const resolvedDependency = childContainer.resolveProvider(childDependencyToken);
			expect(resolvedDependency).toBe(1);
		});
	});

	describe("resolveAsyncDependency", () => {
		it("should resolve a dependency from the current container", async () => {
			const containerRepresentation = new ContainerRepresentation();

			const dependencyToken = new ProviderIdentifierAsSymbol(Symbol.for("dependency") as DependencyTokenType);
			const dependencyEntry = new ProviderDefinitionForValue(
				dependencyToken,
				new ProviderConstructionMethodForValue(1),
				ProviderScope.SINGLETON,
			);
			containerRepresentation.registerProvider(dependencyEntry);

			const container = new Container(containerRepresentation);

			const resolvedDependency = container.resolveAsyncProvider(dependencyToken);
			expect(resolvedDependency).toBeInstanceOf(Promise);
			await expect(resolvedDependency).resolves.toBe(1);
		});

		it("should resolve a dependency from the parent container", async () => {
			const parentRepresentation = new ContainerRepresentation();

			const parentDependencyToken = new ProviderIdentifierAsSymbol(
				Symbol.for("dependency") as DependencyTokenType,
			);
			const parentDependencyEntry = new ProviderDefinitionForValue(
				parentDependencyToken,
				new ProviderConstructionMethodForValue(1),
				ProviderScope.SINGLETON,
			);
			parentRepresentation.registerProvider(parentDependencyEntry);
			const parentContainer = new Container(parentRepresentation);

			const childRepresentation = new ContainerRepresentation();
			const childContainer = new Container(childRepresentation, parentContainer);

			const resolvedDependency = childContainer.resolveAsyncProvider(parentDependencyToken);
			expect(resolvedDependency).toBeInstanceOf(Promise);
			await expect(resolvedDependency).resolves.toBe(1);
		});

		it("should resolve a dependency that is from a provider in the parent container", async () => {
			const parentRepresentation = new ContainerRepresentation();

			const parentDependencyToken = new ProviderIdentifierAsSymbol(
				Symbol.for("dependency") as DependencyTokenType,
			);
			const parentDependencyEntry = new ProviderDefinitionForValue(
				parentDependencyToken,
				new ProviderConstructionMethodForValue(1),
				ProviderScope.SINGLETON,
			);
			parentRepresentation.registerProvider(parentDependencyEntry);
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
				[new ProviderDependencyForFunction(parentDependencyToken)],
			);
			childRepresentation.registerProvider(childDependencyEntry);
			const childContainer = new Container(childRepresentation, parentContainer);

			const resolvedDependency = childContainer.resolveAsyncProvider(childDependencyToken);
			expect(resolvedDependency).toBeInstanceOf(Promise);
			await expect(resolvedDependency).resolves.toBe(1);
		});
	});

	describe("resolveEverythingLocal", () => {
		it("should resolve all singleton providers in the container", () => {
			const containerRepresentation = new ContainerRepresentation();

			// Create factory functions that track invocations
			let factory1CallCount = 0;
			let factory2CallCount = 0;

			const factory1 = () => {
				factory1CallCount++;
				return "singleton1";
			};
			const factory2 = () => {
				factory2CallCount++;
				return "singleton2";
			};

			const singletonToken1 = new ProviderIdentifierAsSymbol(Symbol.for("singleton1") as DependencyTokenType);
			const singletonToken2 = new ProviderIdentifierAsSymbol(Symbol.for("singleton2") as DependencyTokenType);

			const singletonEntry1 = new ProviderDefinitionForFunction(
				singletonToken1,
				new ProviderConstructionMethodForFactory(factory1),
				ProviderScope.SINGLETON,
				[],
			);
			const singletonEntry2 = new ProviderDefinitionForFunction(
				singletonToken2,
				new ProviderConstructionMethodForFactory(factory2),
				ProviderScope.SINGLETON,
				[],
			);

			containerRepresentation.registerProvider(singletonEntry1);
			containerRepresentation.registerProvider(singletonEntry2);

			const container = new Container(containerRepresentation);

			// Before resolving everything, factories should not have been called
			expect(factory1CallCount).toBe(0);
			expect(factory2CallCount).toBe(0);

			container.resolveEverythingLocal();

			// After resolving everything, each factory should have been called exactly once
			expect(factory1CallCount).toBe(1);
			expect(factory2CallCount).toBe(1);

			// Verify that subsequent calls return the same instance (singleton behavior)
			const resolved1 = container.resolveLocalProvider(singletonToken1);
			const resolved2 = container.resolveLocalProvider(singletonToken2);
			expect(resolved1).toBe("singleton1");
			expect(resolved2).toBe("singleton2");

			// Factories should not be called again for singleton providers
			expect(factory1CallCount).toBe(1);
			expect(factory2CallCount).toBe(1);
		});

		it("should resolve all transient providers in the container", () => {
			const containerRepresentation = new ContainerRepresentation();

			// Create factory functions that track invocations
			let factory1CallCount = 0;
			let factory2CallCount = 0;

			const factory1 = () => {
				factory1CallCount++;
				return "transient1";
			};
			const factory2 = () => {
				factory2CallCount++;
				return "transient2";
			};

			const transientToken1 = new ProviderIdentifierAsSymbol(Symbol.for("transient1") as DependencyTokenType);
			const transientToken2 = new ProviderIdentifierAsSymbol(Symbol.for("transient2") as DependencyTokenType);

			const transientEntry1 = new ProviderDefinitionForFunction(
				transientToken1,
				new ProviderConstructionMethodForFactory(factory1),
				ProviderScope.TRANSIENT,
				[],
			);
			const transientEntry2 = new ProviderDefinitionForFunction(
				transientToken2,
				new ProviderConstructionMethodForFactory(factory2),
				ProviderScope.TRANSIENT,
				[],
			);

			containerRepresentation.registerProvider(transientEntry1);
			containerRepresentation.registerProvider(transientEntry2);

			const container = new Container(containerRepresentation);

			// Before resolving everything, factories should not have been called
			expect(factory1CallCount).toBe(0);
			expect(factory2CallCount).toBe(0);

			// Transient providers should not be cached, but resolveEverythingLocal should not throw
			expect(() => container.resolveEverythingLocal()).not.toThrow();

			// After resolving everything, each factory should have been called exactly once
			expect(factory1CallCount).toBe(1);
			expect(factory2CallCount).toBe(1);

			// Verify we can still resolve them individually (transient creates new instances)
			const resolved1 = container.resolveLocalProvider(transientToken1);
			const resolved2 = container.resolveLocalProvider(transientToken2);
			expect(resolved1).toBe("transient1");
			expect(resolved2).toBe("transient2");

			// For transient providers, factories should be called again
			expect(factory1CallCount).toBe(2);
			expect(factory2CallCount).toBe(2);
		});

		it("should resolve mixed singleton and transient providers", () => {
			const containerRepresentation = new ContainerRepresentation();

			// Create factory functions that track invocations
			let singletonFactoryCallCount = 0;
			let transientFactoryCallCount = 0;

			const singletonFactory = () => {
				singletonFactoryCallCount++;
				return "singleton";
			};
			const transientFactory = () => {
				transientFactoryCallCount++;
				return "transient";
			};

			const singletonToken = new ProviderIdentifierAsSymbol(Symbol.for("singleton") as DependencyTokenType);
			const transientToken = new ProviderIdentifierAsSymbol(Symbol.for("transient") as DependencyTokenType);

			const singletonEntry = new ProviderDefinitionForFunction(
				singletonToken,
				new ProviderConstructionMethodForFactory(singletonFactory),
				ProviderScope.SINGLETON,
				[],
			);
			const transientEntry = new ProviderDefinitionForFunction(
				transientToken,
				new ProviderConstructionMethodForFactory(transientFactory),
				ProviderScope.TRANSIENT,
				[],
			);

			containerRepresentation.registerProvider(singletonEntry);
			containerRepresentation.registerProvider(transientEntry);

			const container = new Container(containerRepresentation);

			// Before resolving everything
			expect(singletonFactoryCallCount).toBe(0);
			expect(transientFactoryCallCount).toBe(0);

			container.resolveEverythingLocal();

			// After resolving everything, both factories should have been called once
			expect(singletonFactoryCallCount).toBe(1);
			expect(transientFactoryCallCount).toBe(1);

			// Verify singleton behavior (cached)
			const resolvedSingleton1 = container.resolveLocalProvider(singletonToken);
			const resolvedSingleton2 = container.resolveLocalProvider(singletonToken);
			expect(resolvedSingleton1).toBe("singleton");
			expect(resolvedSingleton2).toBe("singleton");
			expect(singletonFactoryCallCount).toBe(1); // Should not increase

			// Verify transient behavior (new instance each time)
			const resolvedTransient1 = container.resolveLocalProvider(transientToken);
			const resolvedTransient2 = container.resolveLocalProvider(transientToken);
			expect(resolvedTransient1).toBe("transient");
			expect(resolvedTransient2).toBe("transient");
			expect(transientFactoryCallCount).toBe(3); // Should increase for each call
		});

		it("should resolve class providers with dependencies", () => {
			const containerRepresentation = new ContainerRepresentation();

			// Create factory functions that track invocations
			let dependencyFactoryCallCount = 0;
			let classConstructorCallCount = 0;

			const dependencyFactory = () => {
				dependencyFactoryCallCount++;
				return "dependency";
			};

			const classType = class TestClass {
				public constructor(public readonly dependency: string) {
					classConstructorCallCount++;
				}
			};

			const dependencyToken = new ProviderIdentifierAsSymbol(Symbol.for("dependency") as DependencyTokenType);
			const classToken = new ProviderIdentifierAsSymbol(Symbol.for("class") as DependencyTokenType);

			const dependencyEntry = new ProviderDefinitionForFunction(
				dependencyToken,
				new ProviderConstructionMethodForFactory(dependencyFactory),
				ProviderScope.SINGLETON,
				[],
			);

			const classEntry = new ProviderDefinitionForClass(
				classToken,
				new ProviderConstructionMethodForClass(classType),
				ProviderScope.SINGLETON,
				[new ProviderDependencyForFunction(dependencyToken)],
			);

			containerRepresentation.registerProvider(dependencyEntry);
			containerRepresentation.registerProvider(classEntry);

			const container = new Container(containerRepresentation);

			// Before resolving everything
			expect(dependencyFactoryCallCount).toBe(0);
			expect(classConstructorCallCount).toBe(0);

			container.resolveEverythingLocal();

			// After resolving everything, both should have been called once
			expect(dependencyFactoryCallCount).toBe(1);
			expect(classConstructorCallCount).toBe(1);

			// Verify the resolved class has the correct dependency
			const resolvedClass = container.resolveLocalProvider(classToken) as InstanceType<typeof classType>;
			expect(resolvedClass).toBeInstanceOf(classType);
			expect(resolvedClass.dependency).toBe("dependency");

			// Verify singleton behavior - no additional calls
			container.resolveLocalProvider(dependencyToken);
			container.resolveLocalProvider(classToken);
			expect(dependencyFactoryCallCount).toBe(1);
			expect(classConstructorCallCount).toBe(1);
		});

		it("should handle empty container gracefully", () => {
			const containerRepresentation = new ContainerRepresentation();
			const container = new Container(containerRepresentation);

			expect(() => container.resolveEverythingLocal()).not.toThrow();
		});
	});

	describe("resolveEverything", () => {
		it("should resolve all providers in current container and child containers", () => {
			const parentRepresentation = new ContainerRepresentation();
			const childRepresentation = new ContainerRepresentation();

			// Create factory functions that track invocations
			let parentFactoryCallCount = 0;
			let childFactoryCallCount = 0;

			const parentFactory = () => {
				parentFactoryCallCount++;
				return "parent";
			};
			const childFactory = () => {
				childFactoryCallCount++;
				return "child";
			};

			const parentToken = new ProviderIdentifierAsSymbol(Symbol.for("parent") as DependencyTokenType);
			const childToken = new ProviderIdentifierAsSymbol(Symbol.for("child") as DependencyTokenType);

			const parentEntry = new ProviderDefinitionForFunction(
				parentToken,
				new ProviderConstructionMethodForFactory(parentFactory),
				ProviderScope.SINGLETON,
				[],
			);
			const childEntry = new ProviderDefinitionForFunction(
				childToken,
				new ProviderConstructionMethodForFactory(childFactory),
				ProviderScope.SINGLETON,
				[],
			);

			parentRepresentation.registerProvider(parentEntry);
			childRepresentation.registerProvider(childEntry);

			const parentContainer = new Container(parentRepresentation);
			const childContainer = new Container(childRepresentation, parentContainer);

			// Before resolving everything
			expect(parentFactoryCallCount).toBe(0);
			expect(childFactoryCallCount).toBe(0);

			parentContainer.resolveEverything();

			// After resolving everything, both factories should have been called once
			expect(parentFactoryCallCount).toBe(1);
			expect(childFactoryCallCount).toBe(1);

			// Verify the resolved values
			expect(parentContainer.resolveLocalProvider(parentToken)).toBe("parent");
			expect(childContainer.resolveLocalProvider(childToken)).toBe("child");
		});

		it("should resolve providers in nested container hierarchy", () => {
			const grandparentRepresentation = new ContainerRepresentation();
			const parentRepresentation = new ContainerRepresentation();
			const childRepresentation = new ContainerRepresentation();

			// Create factory functions that track invocations
			let grandparentFactoryCallCount = 0;
			let parentFactoryCallCount = 0;
			let childFactoryCallCount = 0;

			const grandparentFactory = () => {
				grandparentFactoryCallCount++;
				return "grandparent";
			};
			const parentFactory = () => {
				parentFactoryCallCount++;
				return "parent";
			};
			const childFactory = () => {
				childFactoryCallCount++;
				return "child";
			};

			const grandparentToken = new ProviderIdentifierAsSymbol(Symbol.for("grandparent") as DependencyTokenType);
			const parentToken = new ProviderIdentifierAsSymbol(Symbol.for("parent") as DependencyTokenType);
			const childToken = new ProviderIdentifierAsSymbol(Symbol.for("child") as DependencyTokenType);

			const grandparentEntry = new ProviderDefinitionForFunction(
				grandparentToken,
				new ProviderConstructionMethodForFactory(grandparentFactory),
				ProviderScope.SINGLETON,
				[],
			);
			const parentEntry = new ProviderDefinitionForFunction(
				parentToken,
				new ProviderConstructionMethodForFactory(parentFactory),
				ProviderScope.SINGLETON,
				[],
			);
			const childEntry = new ProviderDefinitionForFunction(
				childToken,
				new ProviderConstructionMethodForFactory(childFactory),
				ProviderScope.SINGLETON,
				[],
			);

			grandparentRepresentation.registerProvider(grandparentEntry);
			parentRepresentation.registerProvider(parentEntry);
			childRepresentation.registerProvider(childEntry);

			const grandparentContainer = new Container(grandparentRepresentation);
			const parentContainer = new Container(parentRepresentation, grandparentContainer);
			const childContainer = new Container(childRepresentation, parentContainer);

			// Before resolving everything
			expect(grandparentFactoryCallCount).toBe(0);
			expect(parentFactoryCallCount).toBe(0);
			expect(childFactoryCallCount).toBe(0);

			grandparentContainer.resolveEverything();

			// After resolving everything, all factories should have been called once
			expect(grandparentFactoryCallCount).toBe(1);
			expect(parentFactoryCallCount).toBe(1);
			expect(childFactoryCallCount).toBe(1);

			// Verify the resolved values
			expect(grandparentContainer.resolveLocalProvider(grandparentToken)).toBe("grandparent");
			expect(parentContainer.resolveLocalProvider(parentToken)).toBe("parent");
			expect(childContainer.resolveLocalProvider(childToken)).toBe("child");
		});

		it("should handle container with no child containers", () => {
			const containerRepresentation = new ContainerRepresentation();

			// Create factory function that tracks invocations
			let factoryCallCount = 0;

			const factory = () => {
				factoryCallCount++;
				return "value";
			};

			const token = new ProviderIdentifierAsSymbol(Symbol.for("token") as DependencyTokenType);
			const entry = new ProviderDefinitionForFunction(
				token,
				new ProviderConstructionMethodForFactory(factory),
				ProviderScope.SINGLETON,
				[],
			);

			containerRepresentation.registerProvider(entry);
			const container = new Container(containerRepresentation);

			// Before resolving everything
			expect(factoryCallCount).toBe(0);

			container.resolveEverything();

			// After resolving everything, factory should have been called once
			expect(factoryCallCount).toBe(1);
			expect(container.resolveLocalProvider(token)).toBe("value");
		});
	});

	describe("resolveEverythingLocalAsync", () => {
		it("should resolve all singleton providers asynchronously", async () => {
			const containerRepresentation = new ContainerRepresentation();

			// Create factory functions that track invocations
			let factory1CallCount = 0;
			let factory2CallCount = 0;

			const factory1 = () => {
				factory1CallCount++;
				return "singleton1";
			};
			const factory2 = () => {
				factory2CallCount++;
				return "singleton2";
			};

			const singletonToken1 = new ProviderIdentifierAsSymbol(Symbol.for("singleton1") as DependencyTokenType);
			const singletonToken2 = new ProviderIdentifierAsSymbol(Symbol.for("singleton2") as DependencyTokenType);

			const singletonEntry1 = new ProviderDefinitionForFunction(
				singletonToken1,
				new ProviderConstructionMethodForFactory(factory1),
				ProviderScope.SINGLETON,
				[],
			);
			const singletonEntry2 = new ProviderDefinitionForFunction(
				singletonToken2,
				new ProviderConstructionMethodForFactory(factory2),
				ProviderScope.SINGLETON,
				[],
			);

			containerRepresentation.registerProvider(singletonEntry1);
			containerRepresentation.registerProvider(singletonEntry2);

			const container = new Container(containerRepresentation);

			// Before resolving everything
			expect(factory1CallCount).toBe(0);
			expect(factory2CallCount).toBe(0);

			await container.resolveEverythingLocalAsync();

			// After resolving everything, each factory should have been called exactly once
			expect(factory1CallCount).toBe(1);
			expect(factory2CallCount).toBe(1);

			// Verify that subsequent calls return the same instance (singleton behavior)
			const resolved1 = await container.resolveAsyncLocalProvider(singletonToken1);
			const resolved2 = await container.resolveAsyncLocalProvider(singletonToken2);
			expect(resolved1).toBe("singleton1");
			expect(resolved2).toBe("singleton2");

			// Factories should not be called again for singleton providers
			expect(factory1CallCount).toBe(1);
			expect(factory2CallCount).toBe(1);
		});

		it("should resolve all transient providers asynchronously", async () => {
			const containerRepresentation = new ContainerRepresentation();

			// Create factory functions that track invocations
			let factory1CallCount = 0;
			let factory2CallCount = 0;

			const factory1 = () => {
				factory1CallCount++;
				return "transient1";
			};
			const factory2 = () => {
				factory2CallCount++;
				return "transient2";
			};

			const transientToken1 = new ProviderIdentifierAsSymbol(Symbol.for("transient1") as DependencyTokenType);
			const transientToken2 = new ProviderIdentifierAsSymbol(Symbol.for("transient2") as DependencyTokenType);

			const transientEntry1 = new ProviderDefinitionForFunction(
				transientToken1,
				new ProviderConstructionMethodForFactory(factory1),
				ProviderScope.TRANSIENT,
				[],
			);
			const transientEntry2 = new ProviderDefinitionForFunction(
				transientToken2,
				new ProviderConstructionMethodForFactory(factory2),
				ProviderScope.TRANSIENT,
				[],
			);

			containerRepresentation.registerProvider(transientEntry1);
			containerRepresentation.registerProvider(transientEntry2);

			const container = new Container(containerRepresentation);

			// Before resolving everything
			expect(factory1CallCount).toBe(0);
			expect(factory2CallCount).toBe(0);

			// Should not throw
			await expect(container.resolveEverythingLocalAsync()).resolves.not.toThrow();

			// After resolving everything, each factory should have been called once
			expect(factory1CallCount).toBe(1);
			expect(factory2CallCount).toBe(1);

			// Verify we can still resolve them individually (transient creates new instances)
			expect(await container.resolveAsyncLocalProvider(transientToken1)).toBe("transient1");
			expect(await container.resolveAsyncLocalProvider(transientToken2)).toBe("transient2");

			// For transient providers, factories should be called again
			expect(factory1CallCount).toBe(2);
			expect(factory2CallCount).toBe(2);
		});

		it("should handle empty container gracefully", async () => {
			const containerRepresentation = new ContainerRepresentation();
			const container = new Container(containerRepresentation);

			await expect(container.resolveEverythingLocalAsync()).resolves.not.toThrow();
		});
	});

	describe("resolveEverythingAsync", () => {
		it("should resolve all providers in current container and child containers asynchronously", async () => {
			const parentRepresentation = new ContainerRepresentation();
			const childRepresentation = new ContainerRepresentation();

			// Create factory functions that track invocations
			let parentFactoryCallCount = 0;
			let childFactoryCallCount = 0;

			const parentFactory = () => {
				parentFactoryCallCount++;
				return "parent";
			};
			const childFactory = () => {
				childFactoryCallCount++;
				return "child";
			};

			const parentToken = new ProviderIdentifierAsSymbol(Symbol.for("parent") as DependencyTokenType);
			const childToken = new ProviderIdentifierAsSymbol(Symbol.for("child") as DependencyTokenType);

			const parentEntry = new ProviderDefinitionForFunction(
				parentToken,
				new ProviderConstructionMethodForFactory(parentFactory),
				ProviderScope.SINGLETON,
				[],
			);
			const childEntry = new ProviderDefinitionForFunction(
				childToken,
				new ProviderConstructionMethodForFactory(childFactory),
				ProviderScope.SINGLETON,
				[],
			);

			parentRepresentation.registerProvider(parentEntry);
			childRepresentation.registerProvider(childEntry);

			const parentContainer = new Container(parentRepresentation);
			const childContainer = new Container(childRepresentation, parentContainer);

			// Before resolving everything
			expect(parentFactoryCallCount).toBe(0);
			expect(childFactoryCallCount).toBe(0);

			await parentContainer.resolveEverythingAsync();

			// After resolving everything, both factories should have been called once
			expect(parentFactoryCallCount).toBe(1);
			expect(childFactoryCallCount).toBe(1);

			// Verify the resolved values
			expect(await parentContainer.resolveAsyncLocalProvider(parentToken)).toBe("parent");
			expect(await childContainer.resolveAsyncLocalProvider(childToken)).toBe("child");
		});

		it("should resolve providers in nested container hierarchy asynchronously", async () => {
			const grandparentRepresentation = new ContainerRepresentation();
			const parentRepresentation = new ContainerRepresentation();
			const childRepresentation = new ContainerRepresentation();

			// Create factory functions that track invocations
			let grandparentFactoryCallCount = 0;
			let parentFactoryCallCount = 0;
			let childFactoryCallCount = 0;

			const grandparentFactory = () => {
				grandparentFactoryCallCount++;
				return "grandparent";
			};
			const parentFactory = () => {
				parentFactoryCallCount++;
				return "parent";
			};
			const childFactory = () => {
				childFactoryCallCount++;
				return "child";
			};

			const grandparentToken = new ProviderIdentifierAsSymbol(Symbol.for("grandparent") as DependencyTokenType);
			const parentToken = new ProviderIdentifierAsSymbol(Symbol.for("parent") as DependencyTokenType);
			const childToken = new ProviderIdentifierAsSymbol(Symbol.for("child") as DependencyTokenType);

			const grandparentEntry = new ProviderDefinitionForFunction(
				grandparentToken,
				new ProviderConstructionMethodForFactory(grandparentFactory),
				ProviderScope.SINGLETON,
				[],
			);
			const parentEntry = new ProviderDefinitionForFunction(
				parentToken,
				new ProviderConstructionMethodForFactory(parentFactory),
				ProviderScope.SINGLETON,
				[],
			);
			const childEntry = new ProviderDefinitionForFunction(
				childToken,
				new ProviderConstructionMethodForFactory(childFactory),
				ProviderScope.SINGLETON,
				[],
			);

			grandparentRepresentation.registerProvider(grandparentEntry);
			parentRepresentation.registerProvider(parentEntry);
			childRepresentation.registerProvider(childEntry);

			const grandparentContainer = new Container(grandparentRepresentation);
			const parentContainer = new Container(parentRepresentation, grandparentContainer);
			const childContainer = new Container(childRepresentation, parentContainer);

			// Before resolving everything
			expect(grandparentFactoryCallCount).toBe(0);
			expect(parentFactoryCallCount).toBe(0);
			expect(childFactoryCallCount).toBe(0);

			await grandparentContainer.resolveEverythingAsync();

			// After resolving everything, all factories should have been called once
			expect(grandparentFactoryCallCount).toBe(1);
			expect(parentFactoryCallCount).toBe(1);
			expect(childFactoryCallCount).toBe(1);

			// Verify the resolved values
			expect(await grandparentContainer.resolveAsyncLocalProvider(grandparentToken)).toBe("grandparent");
			expect(await parentContainer.resolveAsyncLocalProvider(parentToken)).toBe("parent");
			expect(await childContainer.resolveAsyncLocalProvider(childToken)).toBe("child");
		});

		it("should handle container with no child containers asynchronously", async () => {
			const containerRepresentation = new ContainerRepresentation();

			// Create factory function that tracks invocations
			let factoryCallCount = 0;

			const factory = () => {
				factoryCallCount++;
				return "value";
			};

			const token = new ProviderIdentifierAsSymbol(Symbol.for("token") as DependencyTokenType);
			const entry = new ProviderDefinitionForFunction(
				token,
				new ProviderConstructionMethodForFactory(factory),
				ProviderScope.SINGLETON,
				[],
			);

			containerRepresentation.registerProvider(entry);
			const container = new Container(containerRepresentation);

			// Before resolving everything
			expect(factoryCallCount).toBe(0);

			await container.resolveEverythingAsync();

			// After resolving everything, factory should have been called once
			expect(factoryCallCount).toBe(1);
			expect(await container.resolveAsyncLocalProvider(token)).toBe("value");
		});
	});
});
