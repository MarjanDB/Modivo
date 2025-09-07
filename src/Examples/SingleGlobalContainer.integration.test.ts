import { ContainerBuilder, ProviderTicketMaster } from "Modivo";

describe("SingleGlobalContainer", () => {
	it("supports a global container that can be used to resolve providers", () => {
		const containerBuilder = ContainerBuilder.create();

		const provider = ProviderTicketMaster.createTicket({
			identifier: "dependency",
			value: 1,
		});

		containerBuilder.register(provider);
		const container = containerBuilder.build();

		expect(container.resolveDependency(provider.token)).toBe(1);
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

		expect(container.resolveDependency(providerValue.token)).toBe("value");
		expect(container.resolveDependency(providerFunction.token)).toBe("function");
		expect(container.resolveDependency(providerClass.token)).toBeInstanceOf(TestClass);

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

		expect(container.resolveDependency(providerValue.token)).toBe("value");
		expect(container.resolveDependency(providerFunction.token)).toBe("value function");
	});
});
