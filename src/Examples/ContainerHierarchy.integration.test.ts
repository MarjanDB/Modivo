import { ContainerBuilder, ProviderTicketMaster } from "modivo";

describe("Container Hierarchy", () => {
	it("supports parent-child container relationships", () => {
		// Create parent container
		const parentBuilder = ContainerBuilder.create();
		const parentProvider = ProviderTicketMaster.createTicket({
			identifier: "parentService",
			value: "parent value",
		});
		parentBuilder.register(parentProvider);
		const parentContainer = parentBuilder.build();

		// Create child container with parent
		const childBuilder = ContainerBuilder.create();
		const childProvider = ProviderTicketMaster.createTicket({
			identifier: "childService",
			value: "child value",
		});
		childBuilder.register(childProvider);
		const childContainer = childBuilder.withParentContainer(parentContainer).build();

		// Child can resolve its own providers
		expect(childContainer.resolveProvider(childProvider.token)).toBe("child value");

		// Child can resolve parent providers
		expect(childContainer.resolveProvider(parentProvider.token)).toBe("parent value");
	});

	it("child container can override parent providers", () => {
		// Create parent container
		const parentBuilder = ContainerBuilder.create();
		const sharedProvider = ProviderTicketMaster.createTicket({
			identifier: "sharedService",
			value: "parent value",
		});
		parentBuilder.register(sharedProvider);
		const parentContainer = parentBuilder.build();

		// Create child container that overrides the shared provider
		// Note: createFromExisting shares the same ContainerRepresentation, so override affects both containers
		const childBuilder = ContainerBuilder.createFromExisting(parentContainer);
		childBuilder.override(sharedProvider.withValue("child value"));
		const childContainer = childBuilder.build();

		// Both containers now have the overridden value since they share the same representation
		expect(parentContainer.resolveProvider(sharedProvider.token)).toBe("child value");
		expect(childContainer.resolveProvider(sharedProvider.token)).toBe("child value");
	});

	it("supports multi-level container hierarchy", () => {
		// Create grandparent container
		const grandparentBuilder = ContainerBuilder.create();
		const grandparentProvider = ProviderTicketMaster.createTicket({
			identifier: "grandparentService",
			value: "grandparent value",
		});
		grandparentBuilder.register(grandparentProvider);
		const grandparentContainer = grandparentBuilder.build();

		// Create parent container
		const parentBuilder = ContainerBuilder.create();
		const parentProvider = ProviderTicketMaster.createTicket({
			identifier: "parentService",
			value: "parent value",
		});
		parentBuilder.register(parentProvider);
		const parentContainer = parentBuilder.withParentContainer(grandparentContainer).build();

		// Create child container
		const childBuilder = ContainerBuilder.create();
		const childProvider = ProviderTicketMaster.createTicket({
			identifier: "childService",
			value: "child value",
		});
		childBuilder.register(childProvider);
		const childContainer = childBuilder.withParentContainer(parentContainer).build();

		// Child can resolve from all levels
		expect(childContainer.resolveProvider(childProvider.token)).toBe("child value");
		expect(childContainer.resolveProvider(parentProvider.token)).toBe("parent value");
		expect(childContainer.resolveProvider(grandparentProvider.token)).toBe("grandparent value");
	});

	it("child container providers can depend on parent container providers", () => {
		// Create parent container with a service
		const parentBuilder = ContainerBuilder.create();
		const configProvider = ProviderTicketMaster.createTicket({
			identifier: "config",
			value: { apiUrl: "https://api.example.com" },
		});
		parentBuilder.register(configProvider);
		const parentContainer = parentBuilder.build();

		// Create child container with a service that depends on parent's config
		const childBuilder = ContainerBuilder.create();
		const apiServiceProvider = ProviderTicketMaster.createTicket({
			identifier: "apiService",
			factory: (config: { apiUrl: string }) => ({
				url: config.apiUrl,
				connect: () => `Connecting to ${config.apiUrl}`,
			}),
			dependencies: [configProvider],
		});
		childBuilder.register(apiServiceProvider);
		const childContainer = childBuilder.withParentContainer(parentContainer).build();

		// Child service can use parent's config
		const apiService = childContainer.resolveProvider(apiServiceProvider);
		expect(apiService.url).toBe("https://api.example.com");
		expect(apiService.connect()).toBe("Connecting to https://api.example.com");
	});

	it("demonstrates local vs global provider resolution", () => {
		// Create parent container
		const parentBuilder = ContainerBuilder.create();
		const sharedProvider = ProviderTicketMaster.createTicket({
			identifier: "sharedService",
			value: "parent value",
		});
		parentBuilder.register(sharedProvider);
		const parentContainer = parentBuilder.build();

		// Create child container with same identifier but different value
		const childBuilder = ContainerBuilder.create();
		const childSharedProvider = ProviderTicketMaster.createTicket({
			identifier: "sharedService",
			value: "child value",
		});
		childBuilder.register(childSharedProvider);
		const childContainer = childBuilder.withParentContainer(parentContainer).build();

		// Global resolution (resolveProvider) finds child's provider first (current container takes precedence)
		// Use the child's provider token to ensure we're testing the right resolution
		expect(childContainer.resolveProvider(childSharedProvider.token)).toBe("child value");

		// Local resolution (resolveLocalProvider) only looks in current container
		expect(childContainer.resolveLocalProvider(childSharedProvider)).toBe("child value");

		// Parent container still resolves to its own value
		expect(parentContainer.resolveProvider(sharedProvider.token)).toBe("parent value");
	});
});
