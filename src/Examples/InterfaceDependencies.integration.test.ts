import { ContainerBuilder, ProviderTicketMaster } from "modivo";

describe("Interface Dependencies", () => {
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
});
