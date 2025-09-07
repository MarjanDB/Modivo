import { ProviderIdentifierAsString } from "@lib/lib/ProviderRepresentation/ProviderIdentifierDefinition.js";
import { ProviderScope } from "@lib/lib/ProviderRepresentation/ProviderScope.js";
import { ProviderTicketForValue, ProviderTicketMaster } from "@lib/lib/UsageImplementation/ProviderTicketMaster.js";

/**
 * These tests are mostly to validate the type safety of the ProviderTicketForValue class.
 * Asserts are dummy, they are not actually testing anything.
 */
describe("ProviderTicketForValue", () => {
	it("should be able to handle primitive values", () => {
		const providerTicketForValue = ProviderTicketMaster.createTicketForValue(
			new ProviderIdentifierAsString("test"),
			42,
		);

		expect(providerTicketForValue).toBeInstanceOf(ProviderTicketForValue);
	});

	it("should be able to handle string values", () => {
		const providerTicketForValue = ProviderTicketMaster.createTicketForValue(
			new ProviderIdentifierAsString("test"),
			"hello world",
		);

		expect(providerTicketForValue).toBeInstanceOf(ProviderTicketForValue);
	});

	it("should be able to handle object values", () => {
		const testObject = { name: "test", value: 123 };
		const providerTicketForValue = ProviderTicketMaster.createTicketForValue(
			new ProviderIdentifierAsString("test"),
			testObject,
		);

		expect(providerTicketForValue).toBeInstanceOf(ProviderTicketForValue);
	});

	it("should be able to handle const values with specific types", () => {
		const providerTicketForValue = ProviderTicketMaster.createTicketForValue(
			new ProviderIdentifierAsString("test"),
			5 as const,
		);

		function thatOnlyAccepts5(value: 5) {
			return value;
		}

		thatOnlyAccepts5(providerTicketForValue.value);

		expect(providerTicketForValue).toBeInstanceOf(ProviderTicketForValue);
	});

	it("should be able to handle null and undefined values", () => {
		const nullTicket = ProviderTicketMaster.createTicketForValue(new ProviderIdentifierAsString("nullTest"), null);

		const undefinedTicket = ProviderTicketMaster.createTicketForValue(
			new ProviderIdentifierAsString("undefinedTest"),
			undefined,
		);

		expect(nullTicket).toBeInstanceOf(ProviderTicketForValue);
		expect(undefinedTicket).toBeInstanceOf(ProviderTicketForValue);
	});

	it("should be able to handle array values", () => {
		const testArray = [1, 2, 3, "four", { five: 5 }];
		const providerTicketForValue = ProviderTicketMaster.createTicketForValue(
			new ProviderIdentifierAsString("arrayTest"),
			testArray,
		);

		expect(providerTicketForValue).toBeInstanceOf(ProviderTicketForValue);
	});

	it("should be able to handle function values", () => {
		const testFunction = () => "test";
		const providerTicketForValue = ProviderTicketMaster.createTicketForValue(
			new ProviderIdentifierAsString("functionTest"),
			testFunction,
		);

		expect(providerTicketForValue).toBeInstanceOf(ProviderTicketForValue);
	});

	it("should support withScope method", () => {
		const originalTicket = ProviderTicketMaster.createTicketForValue(new ProviderIdentifierAsString("test"), 42);

		const scopedTicket = originalTicket.withScope(ProviderScope.TRANSIENT);

		expect(scopedTicket).toBeInstanceOf(ProviderTicketForValue);
	});

	it("should support withValue method", () => {
		const originalTicket = ProviderTicketMaster.createTicketForValue(new ProviderIdentifierAsString("test"), 42);

		const newValueTicket = originalTicket.withValue("new value");

		expect(newValueTicket).toBeInstanceOf(ProviderTicketForValue);
	});
});
