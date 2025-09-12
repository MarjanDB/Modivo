import { ContainerBuilder, ProviderTicketMaster } from "modivo";

describe("Async Providers", () => {
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
