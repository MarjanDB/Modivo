import { ContainerBuilder, ProviderTicketMaster } from "modivo";

describe("Type-Safe Dependencies", () => {
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
});
