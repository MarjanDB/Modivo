import { ProviderIdentifierAsString } from "@lib/lib/ProviderRepresentation/ProviderIdentifierDefinition.js";
import { ProviderTicketForFunction, ProviderTicketMaster } from "@lib/lib/UsageImplementation/ProviderTicketMaster.js";

/**
 * These tests are mostly to validate the type safety of the ProviderTicketForFunction class.
 * Asserts are dummy, they are not actually testing anything.
 */
describe("ProviderTicketForFunction", () => {
	it("should be able to handle plain functions with no dependencies", () => {
		const providerTicketForFunction = ProviderTicketMaster.createTicketForFunction(new ProviderIdentifierAsString(
			"test",
		), () => {
			return {};
		}, []);

		expect(providerTicketForFunction).toBeInstanceOf(ProviderTicketForFunction);
	});

	it("should be able to handle functions that return a specific type", () => {
		const providerTicketForFunction = ProviderTicketMaster.createTicketForFunction(new ProviderIdentifierAsString(
			"test",
		), () => {
			return 5 as const;
		}, []);

		function thatOnlyAccepts5(value: 5) {
			return value;
		}

		thatOnlyAccepts5(providerTicketForFunction.factory());

		expect(providerTicketForFunction).toBeInstanceOf(ProviderTicketForFunction);
	});

	it("should enforce dependencies to be of the correct type", () => {
		const numberDependency = ProviderTicketMaster.createTicketForValue(
			new ProviderIdentifierAsString("numberDep"),
			42,
		);

		const providerTicketForFunction = ProviderTicketMaster.createTicketForFunction(
			new ProviderIdentifierAsString("test"),
			(dependency: number) => {
				return { value: dependency };
			},
			[numberDependency],
		);

		expect(providerTicketForFunction).toBeInstanceOf(ProviderTicketForFunction);
	});

	it("should enforce dependencies to be of the correct type, enforced via const", () => {
		const numberDependency = ProviderTicketMaster.createTicketForValue(
			new ProviderIdentifierAsString("numberDep"),
			42 as const,
		);

		const providerTicketForFunction = ProviderTicketMaster.createTicketForFunction(
			new ProviderIdentifierAsString("test"),
			(dependency: 42) => {
				return { value: dependency };
			},
			[numberDependency],
		);

		expect(providerTicketForFunction).toBeInstanceOf(ProviderTicketForFunction);
	});
});
