import {
	ContainerBuilder,
	type ProviderOnResolvedAsync,
	type ProviderOnResolvedSync,
	ProviderScope,
	ProviderTicketMaster,
} from "modivo";

describe("Provider Lifecycles", () => {
	describe("ProviderOnResolved for Class Providers", () => {
		it("should call $onResolvedSync when a class provider implements ProviderOnResolvedSync", () => {
			const containerBuilder = ContainerBuilder.create();
			let onResolvedSyncCalled = false;

			class TestClassWithSyncLifecycle implements ProviderOnResolvedSync {
				$afterResolvedSync(): void {
					onResolvedSyncCalled = true;
				}
			}

			const provider = ProviderTicketMaster.createTicket({
				identifier: "testClass",
				class: TestClassWithSyncLifecycle,
			});

			containerBuilder.register(provider);
			const container = containerBuilder.build();

			const instance = container.resolveProvider(provider);

			expect(instance).toBeInstanceOf(TestClassWithSyncLifecycle);
			expect(onResolvedSyncCalled).toBe(true);
		});

		it("should call $onResolvedAsync when a class provider implements ProviderOnResolvedAsync", async () => {
			const containerBuilder = ContainerBuilder.create();
			let onResolvedAsyncCalled = false;

			class TestClassWithAsyncLifecycle implements ProviderOnResolvedAsync {
				async $afterResolvedAsync(): Promise<void> {
					onResolvedAsyncCalled = true;
				}
			}

			const provider = ProviderTicketMaster.createTicket({
				identifier: "testClass",
				class: TestClassWithAsyncLifecycle,
			});

			containerBuilder.register(provider);
			const container = containerBuilder.build();

			const instance = container.resolveProvider(provider);

			expect(instance).toBeInstanceOf(TestClassWithAsyncLifecycle);
			expect(onResolvedAsyncCalled).toBe(true);
		});

		it("should throw an error when a class provider implements both sync and async lifecycle methods", () => {
			const containerBuilder = ContainerBuilder.create();

			class TestClassWithBothLifecycles implements ProviderOnResolvedSync, ProviderOnResolvedAsync {
				$afterResolvedSync(): void {
					// This should not be called
				}

				async $afterResolvedAsync(): Promise<void> {
					// This should not be called
				}
			}

			const provider = ProviderTicketMaster.createTicket({
				identifier: "testClass",
				class: TestClassWithBothLifecycles,
			});

			containerBuilder.register(provider);
			const container = containerBuilder.build();

			expect(() => {
				container.resolveProvider(provider);
			}).toThrow(
				"Provider on resolved and provider on resolved sync are both implemented. Only one should be implemented.",
			);
		});

		it("should work normally when a class provider implements neither lifecycle method", () => {
			const containerBuilder = ContainerBuilder.create();

			class TestClassWithoutLifecycle {
				public value = "test";
			}

			const provider = ProviderTicketMaster.createTicket({
				identifier: "testClass",
				class: TestClassWithoutLifecycle,
			});

			containerBuilder.register(provider);
			const container = containerBuilder.build();

			const instance = container.resolveProvider(provider);

			expect(instance).toBeInstanceOf(TestClassWithoutLifecycle);
			expect(instance.value).toBe("test");
		});

		it("should call lifecycle methods with dependencies resolved", () => {
			const containerBuilder = ContainerBuilder.create();
			let onResolvedSyncCalled = false;
			let resolvedDependency: string | undefined;

			class DependencyClass {
				public value = "dependency value";
			}

			class TestClassWithDependency implements ProviderOnResolvedSync {
				constructor(public dependency: DependencyClass) {}

				$afterResolvedSync(): void {
					onResolvedSyncCalled = true;
					resolvedDependency = this.dependency.value;
				}
			}

			const dependencyProvider = ProviderTicketMaster.createTicket({
				identifier: "dependency",
				class: DependencyClass,
			});

			const provider = ProviderTicketMaster.createTicket({
				identifier: "testClass",
				class: TestClassWithDependency,
				dependencies: [dependencyProvider],
			});

			containerBuilder.register(dependencyProvider);
			containerBuilder.register(provider);
			const container = containerBuilder.build();

			const instance = container.resolveProvider(provider);

			expect(instance).toBeInstanceOf(TestClassWithDependency);
			expect(onResolvedSyncCalled).toBe(true);
			expect(resolvedDependency).toBe("dependency value");
		});

		it("should call async lifecycle methods with dependencies resolved", async () => {
			const containerBuilder = ContainerBuilder.create();
			let onResolvedAsyncCalled = false;
			let resolvedDependency: string | undefined;

			class DependencyClass {
				public value = "async dependency value";
			}

			class TestClassWithAsyncDependency implements ProviderOnResolvedAsync {
				constructor(public dependency: DependencyClass) {}

				async $afterResolvedAsync(): Promise<void> {
					onResolvedAsyncCalled = true;
					resolvedDependency = this.dependency.value;
				}
			}

			const dependencyProvider = ProviderTicketMaster.createTicket({
				identifier: "dependency",
				class: DependencyClass,
			});

			const provider = ProviderTicketMaster.createTicket({
				identifier: "testClass",
				class: TestClassWithAsyncDependency,
				dependencies: [dependencyProvider],
			});

			containerBuilder.register(dependencyProvider);
			containerBuilder.register(provider);
			const container = containerBuilder.build();

			const instance = container.resolveProvider(provider);

			expect(instance).toBeInstanceOf(TestClassWithAsyncDependency);
			expect(onResolvedAsyncCalled).toBe(true);
			expect(resolvedDependency).toBe("async dependency value");
		});

		it("should call $onResolvedSync only once for singleton scope providers", () => {
			const containerBuilder = ContainerBuilder.create();
			let onResolvedSyncCallCount = 0;

			class TestClassWithSyncLifecycle implements ProviderOnResolvedSync {
				$afterResolvedSync(): void {
					onResolvedSyncCallCount++;
				}
			}

			const provider = ProviderTicketMaster.createTicket({
				identifier: "singletonClass",
				class: TestClassWithSyncLifecycle,
				scope: ProviderScope.SINGLETON,
			});

			containerBuilder.register(provider);
			const container = containerBuilder.build();

			// Resolve the same provider multiple times
			const instance1 = container.resolveProvider(provider);
			const instance2 = container.resolveProvider(provider);
			const instance3 = container.resolveProvider(provider);

			expect(instance1).toBe(instance2); // Same instance
			expect(instance2).toBe(instance3); // Same instance
			expect(onResolvedSyncCallCount).toBe(1); // Lifecycle method called only once
		});

		it("should call $onResolvedSync multiple times for transient scope providers", () => {
			const containerBuilder = ContainerBuilder.create();
			let onResolvedSyncCallCount = 0;

			class TestClassWithSyncLifecycle implements ProviderOnResolvedSync {
				$afterResolvedSync(): void {
					onResolvedSyncCallCount++;
				}
			}

			const provider = ProviderTicketMaster.createTicket({
				identifier: "transientClass",
				class: TestClassWithSyncLifecycle,
				scope: ProviderScope.TRANSIENT,
			});

			containerBuilder.register(provider);
			const container = containerBuilder.build();

			// Resolve the same provider multiple times
			const instance1 = container.resolveProvider(provider);
			const instance2 = container.resolveProvider(provider);
			const instance3 = container.resolveProvider(provider);

			expect(instance1).not.toBe(instance2); // Different instances
			expect(instance2).not.toBe(instance3); // Different instances
			expect(onResolvedSyncCallCount).toBe(3); // Lifecycle method called for each instance
		});

		it("should call $onResolvedAsync only once for singleton scope providers", async () => {
			const containerBuilder = ContainerBuilder.create();
			let onResolvedAsyncCallCount = 0;

			class TestClassWithAsyncLifecycle implements ProviderOnResolvedAsync {
				async $afterResolvedAsync(): Promise<void> {
					onResolvedAsyncCallCount++;
				}
			}

			const provider = ProviderTicketMaster.createTicket({
				identifier: "singletonAsyncClass",
				class: TestClassWithAsyncLifecycle,
				scope: ProviderScope.SINGLETON,
			});

			containerBuilder.register(provider);
			const container = containerBuilder.build();

			// Resolve the same provider multiple times
			const instance1 = container.resolveProvider(provider);
			const instance2 = container.resolveProvider(provider);
			const instance3 = container.resolveProvider(provider);

			expect(instance1).toBe(instance2); // Same instance
			expect(instance2).toBe(instance3); // Same instance
			expect(onResolvedAsyncCallCount).toBe(1); // Lifecycle method called only once
		});

		it("should call $onResolvedAsync multiple times for transient scope providers", async () => {
			const containerBuilder = ContainerBuilder.create();
			let onResolvedAsyncCallCount = 0;

			class TestClassWithAsyncLifecycle implements ProviderOnResolvedAsync {
				async $afterResolvedAsync(): Promise<void> {
					onResolvedAsyncCallCount++;
				}
			}

			const provider = ProviderTicketMaster.createTicket({
				identifier: "transientAsyncClass",
				class: TestClassWithAsyncLifecycle,
				scope: ProviderScope.TRANSIENT,
			});

			containerBuilder.register(provider);
			const container = containerBuilder.build();

			// Resolve the same provider multiple times
			const instance1 = container.resolveProvider(provider);
			const instance2 = container.resolveProvider(provider);
			const instance3 = container.resolveProvider(provider);

			expect(instance1).not.toBe(instance2); // Different instances
			expect(instance2).not.toBe(instance3); // Different instances
			expect(onResolvedAsyncCallCount).toBe(3); // Lifecycle method called for each instance
		});
	});

	describe("resolveEverything and resolveEverythingAsync", () => {
		it("should resolve all providers and call their lifecycle methods", () => {
			const containerBuilder = ContainerBuilder.create();
			let lifecycleCallCount = 0;

			class Service implements ProviderOnResolvedSync {
				$afterResolvedSync(): void {
					lifecycleCallCount++;
				}
			}

			const provider = ProviderTicketMaster.createTicket({
				identifier: "service",
				class: Service,
			});

			containerBuilder.register(provider);
			const container = containerBuilder.build();

			expect(lifecycleCallCount).toBe(0);
			container.resolveEverything();
			expect(lifecycleCallCount).toBe(1);
		});

		it("should not call lifecycle methods multiple times for singleton providers", () => {
			const containerBuilder = ContainerBuilder.create();
			let lifecycleCallCount = 0;

			class SingletonService implements ProviderOnResolvedSync {
				$afterResolvedSync(): void {
					lifecycleCallCount++;
				}
			}

			const provider = ProviderTicketMaster.createTicket({
				identifier: "singletonService",
				class: SingletonService,
				scope: ProviderScope.SINGLETON,
			});

			containerBuilder.register(provider);
			const container = containerBuilder.build();

			expect(lifecycleCallCount).toBe(0);
			container.resolveEverything();
			expect(lifecycleCallCount).toBe(1);

			// Call resolveEverything multiple times
			container.resolveEverything();
			container.resolveEverything();
			container.resolveEverything();

			// Lifecycle method should still only have been called once for singleton
			expect(lifecycleCallCount).toBe(1);
		});

		it("should resolve providers across container hierarchy from top down", () => {
			// Parent container
			const parentBuilder = ContainerBuilder.create();
			let parentLifecycleCallCount = 0;

			class ParentService implements ProviderOnResolvedSync {
				$afterResolvedSync(): void {
					parentLifecycleCallCount++;
				}
			}

			parentBuilder.register(
				ProviderTicketMaster.createTicket({
					identifier: "parentService",
					class: ParentService,
				}),
			);
			const parentContainer = parentBuilder.build();

			// Child container
			const childBuilder = ContainerBuilder.create();
			let childLifecycleCallCount = 0;

			class ChildService implements ProviderOnResolvedSync {
				$afterResolvedSync(): void {
					childLifecycleCallCount++;
				}
			}

			childBuilder.register(
				ProviderTicketMaster.createTicket({
					identifier: "childService",
					class: ChildService,
				}),
			);
			const _childContainer = childBuilder.withParentContainer(parentContainer).build();
			// Note that calling resolveEverything on a child will only resolve the child (and its children), and not the parent
			// You should call resolveEverything on the top-most container in the hierarchy to resolve all providers from top down
			// _childContainer.resolveEverything();

			expect(parentLifecycleCallCount).toBe(0);
			expect(childLifecycleCallCount).toBe(0);

			// This is the intended usage of resolveEverything (top-most container)
			parentContainer.resolveEverything();

			expect(parentLifecycleCallCount).toBe(1);
			expect(childLifecycleCallCount).toBe(1);
		});

		it("should resolve providers asynchronously", async () => {
			const containerBuilder = ContainerBuilder.create();
			let asyncLifecycleCallCount = 0;

			class AsyncService implements ProviderOnResolvedAsync {
				async $afterResolvedAsync(): Promise<void> {
					asyncLifecycleCallCount++;
				}
			}

			const provider = ProviderTicketMaster.createTicket({
				identifier: "asyncService",
				class: AsyncService,
			});

			containerBuilder.register(provider);
			const container = containerBuilder.build();

			expect(asyncLifecycleCallCount).toBe(0);
			await container.resolveEverythingAsync();
			expect(asyncLifecycleCallCount).toBe(1);
		});
	});
});
