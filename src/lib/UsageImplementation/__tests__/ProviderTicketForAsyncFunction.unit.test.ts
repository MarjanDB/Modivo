import { ProviderScope } from "@lib/lib/enums/ProviderScope.js";
import { ProviderIdentifierAsString } from "@lib/lib/ProviderRepresentation/ProviderIdentifierDefinition.js";
import {
	ProviderTicketForAsyncFunction,
	ProviderTicketMaster,
} from "@lib/lib/UsageImplementation/ProviderTicketMaster.js";

/**
 * These tests are mostly to validate the type safety of the ProviderTicketForAsyncFunction class.
 * Asserts are dummy, they are not actually testing anything.
 */
describe("ProviderTicketForAsyncFunction", () => {
	it("should be able to handle async functions with no dependencies", () => {
		const providerTicketForAsyncFunction =
			ProviderTicketMaster.createTicketForAsyncFunction(new ProviderIdentifierAsString("test"), async () => {
				return {};
			}, []);

		expect(providerTicketForAsyncFunction).toBeInstanceOf(ProviderTicketForAsyncFunction);
	});

	it("should be able to handle async functions that return a specific type", () => {
		const providerTicketForAsyncFunction =
			ProviderTicketMaster.createTicketForAsyncFunction(new ProviderIdentifierAsString("test"), async () => {
				return 5 as const;
			}, []);

		async function thatOnlyAccepts5(value: Promise<5>) {
			return value;
		}

		thatOnlyAccepts5(providerTicketForAsyncFunction.factory());

		expect(providerTicketForAsyncFunction).toBeInstanceOf(ProviderTicketForAsyncFunction);
	});

	it("should enforce dependencies to be of the correct type", () => {
		const numberDependency = ProviderTicketMaster.createTicketForValue(
			new ProviderIdentifierAsString("numberDep"),
			42,
		);

		const providerTicketForAsyncFunction = ProviderTicketMaster.createTicketForAsyncFunction(
			new ProviderIdentifierAsString("test"),
			async (dependency: number) => {
				return { value: dependency };
			},
			[numberDependency],
		);

		expect(providerTicketForAsyncFunction).toBeInstanceOf(ProviderTicketForAsyncFunction);
	});

	it("should enforce dependencies to be of the correct type, enforced via const", () => {
		const numberDependency = ProviderTicketMaster.createTicketForValue(
			new ProviderIdentifierAsString("numberDep"),
			42 as const,
		);

		const providerTicketForAsyncFunction = ProviderTicketMaster.createTicketForAsyncFunction(
			new ProviderIdentifierAsString("test"),
			async (dependency: 42) => {
				return { value: dependency };
			},
			[numberDependency],
		);

		expect(providerTicketForAsyncFunction).toBeInstanceOf(ProviderTicketForAsyncFunction);
	});

	it("should handle async functions with multiple dependencies", () => {
		const stringDependency = ProviderTicketMaster.createTicketForValue(
			new ProviderIdentifierAsString("stringDep"),
			"hello",
		);

		const numberDependency = ProviderTicketMaster.createTicketForValue(
			new ProviderIdentifierAsString("numberDep"),
			42,
		);

		const providerTicketForAsyncFunction = ProviderTicketMaster.createTicketForAsyncFunction(
			new ProviderIdentifierAsString("test"),
			async (str: string, num: number) => {
				return { message: str, value: num };
			},
			[stringDependency, numberDependency],
		);

		expect(providerTicketForAsyncFunction).toBeInstanceOf(ProviderTicketForAsyncFunction);
	});

	it("should support withScope method", () => {
		const originalTicket = ProviderTicketMaster.createTicketForAsyncFunction(
			new ProviderIdentifierAsString("test"),
			async () => 42,
			[],
		);

		const scopedTicket = originalTicket.withScope(ProviderScope.TRANSIENT);

		expect(scopedTicket).toBeInstanceOf(ProviderTicketForAsyncFunction);
	});

	it("should support withFactory method", () => {
		const originalTicket = ProviderTicketMaster.createTicketForAsyncFunction(
			new ProviderIdentifierAsString("test"),
			async () => 42,
			[],
		);

		const newFactoryTicket = originalTicket.withFactory(
			async (value: string) => ({ message: value }),
			[ProviderTicketMaster.createTicketForValue(new ProviderIdentifierAsString("str"), "test")],
		);

		expect(newFactoryTicket).toBeInstanceOf(ProviderTicketForAsyncFunction);
	});
});
