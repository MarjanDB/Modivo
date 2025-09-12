import { ContainerBuilder, ProviderTicketMaster } from "modivo";

describe("Basic Usage", () => {
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

	it("ticket can be used to resolve local providers and utilize typescript for type inference", () => {
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
});
