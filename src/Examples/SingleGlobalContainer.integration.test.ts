import { ContainerBuilder, ProviderTicketMaster } from "modivo";

describe("SingleGlobalContainer", () => {
	it("supports a global container that can be used to resolve providers", () => {
		const containerBuilder = ContainerBuilder.create();

		const provider = ProviderTicketMaster.createTicket({
			identifier: "dependency",
			value: 1,
		});

		containerBuilder.register(provider);
		const container = containerBuilder.build();

		expect(container.resolveProvider(provider.token)).toBe(1);
	});

	it("can be used to resolve different types of providers", () => {
		const containerBuilder = ContainerBuilder.create();

		const providerValue = ProviderTicketMaster.createTicket({
			identifier: "providerValue",
			value: "value",
		});

		const providerFunction = ProviderTicketMaster.createTicket({
			identifier: "providerFunction",
			factory: () => "function",
		});

		const providerAsyncFunction = ProviderTicketMaster.createTicket({
			identifier: "providerAsyncFunction",
			asyncFactory: async () => "async function",
		});

		class TestClass {}

		const providerClass = ProviderTicketMaster.createTicket({
			identifier: "providerClass",
			class: TestClass,
		});

		containerBuilder.register(providerValue);
		containerBuilder.register(providerFunction);
		containerBuilder.register(providerAsyncFunction);
		containerBuilder.register(providerClass);
		const container = containerBuilder.build();

		expect(container.resolveProvider(providerValue.token)).toBe("value");
		expect(container.resolveProvider(providerFunction.token)).toBe("function");
		expect(container.resolveProvider(providerClass.token)).toBeInstanceOf(TestClass);

		// TODO: Add support for async functions
		// expect(container.resolveDependency(providerAsyncFunction.token)).toBe("async function");
	});

	it("can be used to resolve providers that use other providers as dependencies", () => {
		const containerBuilder = ContainerBuilder.create();

		const providerValue = ProviderTicketMaster.createTicket({
			identifier: "providerValue",
			value: "value",
		});

		const providerFunction = ProviderTicketMaster.createTicket({
			identifier: "providerFunction",
			factory: (value: string) => `${value} function`,
			dependencies: [providerValue],
		});

		containerBuilder.register(providerValue);
		containerBuilder.register(providerFunction);
		const container = containerBuilder.build();

		expect(container.resolveProvider(providerValue.token)).toBe("value");
		expect(container.resolveProvider(providerFunction.token)).toBe("value function");
	});

	it("ticket can be used to resolve providers and utilize typescript for type inference", () => {
		const containerBuilder = ContainerBuilder.create();

		const providerFunctionTicket = ProviderTicketMaster.createTicket({
			identifier: "providerFunction",
			factory: () => ({ example: "value" }),
		});

		containerBuilder.register(providerFunctionTicket);
		const container = containerBuilder.build();

		const resolvedFunctionValue: { example: string } = container.resolveProvider(providerFunctionTicket);

		expect(resolvedFunctionValue.example).toBe("value");
	});

	it("tickets can also be used to resolve to interface types", () => {
		const containerBuilder = ContainerBuilder.create();

		interface ExampleInterface {
			example: string;
		}

		class ExampleClass implements ExampleInterface {
			example = "value";

			getExample(): string {
				return this.example;
			}
		}

		const providerFunctionTicket = ProviderTicketMaster.createTicket({
			identifier: "providerFunction",
			factory: (): ExampleInterface => new ExampleClass(),
		});

		containerBuilder.register(providerFunctionTicket);
		const container = containerBuilder.build();

		// This resolves to the interface type (ExampleInterface)
		// more specifically, it resolves to the return type of the factory
		const resolvedFunctionValue = container.resolveProvider(providerFunctionTicket);
		expect(resolvedFunctionValue.example).toBe("value");
	});

	it("tickets can also be used to resolve to interface types when using classes", () => {
		const containerBuilder = ContainerBuilder.create();

		interface ExampleInterface {
			getExample(): string;
		}

		class ExampleClass implements ExampleInterface {
			getExample(): string {
				return "value";
			}
		}

		// This interface is not compatible with the class itself, so using it would fail to compile
		// interface ExampleInterface2 {
		// 	getExample2(): string;
		// }

		const providerClassTicket = ProviderTicketMaster.createTicket({
			identifier: "providerFunction",
			class: ExampleClass,
		}).withReturnType<ExampleInterface>();

		containerBuilder.register(providerClassTicket);
		const container = containerBuilder.build();

		// This resolves to the interface type (ExampleInterface)
		// more specifically, it resolves to the return type specified by the withReturnType method
		// (has to be compatible with the class itself though)
		const resolvedFunctionValue = container.resolveProvider(providerClassTicket);
		expect(resolvedFunctionValue.getExample()).toBe("value");
	});

	it("ticket can also be used to resolve local providers and utilize typescript for type inference", () => {
		const containerBuilder = ContainerBuilder.create();

		const providerFunctionTicket = ProviderTicketMaster.createTicket({
			identifier: "providerFunction",
			factory: () => ({ example: "value" }),
		});

		containerBuilder.register(providerFunctionTicket);
		const container = containerBuilder.build();

		const resolvedFunctionValue: { example: string } = container.resolveLocalProvider(providerFunctionTicket);

		expect(resolvedFunctionValue.example).toBe("value");
	});

	it("supports overriding providers", () => {
		const containerBuilder = ContainerBuilder.create();

		const provider = ProviderTicketMaster.createTicket({
			identifier: "dependency",
			value: 1,
		});

		containerBuilder.register(provider);
		const container = containerBuilder.build();
		expect(container.resolveProvider(provider.token)).toBe(1);

		const containerBuilder2 = ContainerBuilder.createFromExisting(container);
		containerBuilder2.override(provider.withValue(2));
		const container2 = containerBuilder2.build();
		expect(container2.resolveProvider(provider.token)).toBe(2);

		// original container should still have the original value
		expect(container.resolveProvider(provider.token)).toBe(1);
	});

	it("supports async providers", async () => {
		const containerBuilder = ContainerBuilder.create();

		const provider = ProviderTicketMaster.createTicket({
			identifier: "dependency",
			asyncFactory: async () => 1,
		});

		containerBuilder.register(provider);
		const container = containerBuilder.build();
		const resolvedValue: number = await container.resolveAsyncProvider(provider);
		expect(resolvedValue).toBe(1);
	});
});
