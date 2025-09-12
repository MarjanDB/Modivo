import { ContainerBuilder, ProviderTicketMaster } from "modivo";

describe("Provider Types", () => {
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
	});
});
