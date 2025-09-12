import { ContainerBuilder, ProviderTicketMaster } from "modivo";

describe("Type Inference", () => {
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
});
