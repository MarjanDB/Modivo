import { ContainerBuilder, ProviderTicketMaster } from "modivo";

describe("Provider Override", () => {
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
});
