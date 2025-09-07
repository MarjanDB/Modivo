import { ContainerBuilder } from "@lib/lib/UsageImplementation/ContainerBuilder.js";
import { ProviderTicketMaster } from "@lib/lib/UsageImplementation/ProviderTicketMaster.js";

describe("SingleGlobalContainer", () => {
	it("supports a global container that can be used to resolve dependencies", () => {
		const containerBuilder = ContainerBuilder.create();

		const provider = ProviderTicketMaster.createTicket({
			identifier: "dependency",
			value: 1,
		});

		containerBuilder.register(provider);
		const container = containerBuilder.build();

		expect(container.resolveLocalDependency(provider.token)).toBe(1);
	});
});
