import { ContainerBuilder, ProviderScope, ProviderTicketMaster } from "modivo";

describe("Provider Scopes", () => {
	it("supports singleton scope - same instance returned every time", () => {
		const containerBuilder = ContainerBuilder.create();

		class TestClass {
			constructor() {
				this.id = Math.random();
			}
			public id: number;
		}

		const provider = ProviderTicketMaster.createTicket({
			identifier: "singletonService",
			class: TestClass,
			scope: ProviderScope.SINGLETON,
		});

		containerBuilder.register(provider);
		const container = containerBuilder.build();

		const instance1 = container.resolveProvider(provider);
		const instance2 = container.resolveProvider(provider);

		expect(instance1).toBe(instance2); // Same instance
		expect(instance1.id).toBe(instance2.id); // Same random ID
	});

	it("supports transient scope - new instance created every time", () => {
		const containerBuilder = ContainerBuilder.create();

		class TestClass {
			constructor() {
				this.id = Math.random();
			}
			public id: number;
		}

		const provider = ProviderTicketMaster.createTicket({
			identifier: "transientService",
			class: TestClass,
			scope: ProviderScope.TRANSIENT,
		});

		containerBuilder.register(provider);
		const container = containerBuilder.build();

		const instance1 = container.resolveProvider(provider);
		const instance2 = container.resolveProvider(provider);

		expect(instance1).not.toBe(instance2); // Different instances
		expect(instance1.id).not.toBe(instance2.id); // Different random IDs
	});

	it("defaults to singleton scope when no scope is specified", () => {
		const containerBuilder = ContainerBuilder.create();

		class TestClass {
			constructor() {
				this.id = Math.random();
			}
			public id: number;
		}

		const provider = ProviderTicketMaster.createTicket({
			identifier: "defaultScopeService",
			class: TestClass,
			// No scope specified - should default to SINGLETON
		});

		containerBuilder.register(provider);
		const container = containerBuilder.build();

		const instance1 = container.resolveProvider(provider);
		const instance2 = container.resolveProvider(provider);

		expect(instance1).toBe(instance2); // Same instance (singleton behavior)
		expect(instance1.id).toBe(instance2.id); // Same random ID
	});

	it("demonstrates singleton scope trumps transient scope for dependencies", () => {
		const containerBuilder = ContainerBuilder.create();

		class DependencyClass {
			constructor() {
				this.id = Math.random();
			}
			public id: number;
		}

		class ServiceClass {
			constructor(public dependency: DependencyClass) {}
		}

		// Transient dependency
		const dependencyProvider = ProviderTicketMaster.createTicket({
			identifier: "dependency",
			class: DependencyClass,
			scope: ProviderScope.TRANSIENT,
		});

		// Singleton service that uses the transient dependency
		const serviceProvider = ProviderTicketMaster.createTicket({
			identifier: "service",
			class: ServiceClass,
			dependencies: [dependencyProvider],
			scope: ProviderScope.SINGLETON, // This makes the dependency singleton too
		});

		containerBuilder.register(dependencyProvider);
		containerBuilder.register(serviceProvider);
		const container = containerBuilder.build();

		const service1 = container.resolveProvider(serviceProvider);
		const service2 = container.resolveProvider(serviceProvider);

		expect(service1).toBe(service2); // Same service instance
		expect(service1.dependency).toBe(service2.dependency); // Same dependency instance (singleton trumps transient)
		expect(service1.dependency.id).toBe(service2.dependency.id); // Same random ID
	});
});
