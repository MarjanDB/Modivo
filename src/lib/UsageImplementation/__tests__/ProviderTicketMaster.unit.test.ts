import { ProviderScope } from "@lib/lib/enums/ProviderScope.js";
import { createProviderIdentifier } from "@lib/lib/ProviderRepresentation/ProviderIdentifierDefinition.js";
import { ProviderTicketMaster } from "@lib/lib/UsageImplementation/ProviderTicketMaster.js";

/**
 * Tests for the ProviderTicketMaster.createTicket method to ensure it works as a type-safe wrapper
 * around all other createTicket methods.
 */
describe("ProviderTicketMaster.createTicket", () => {
	it("should create a ProviderTicketForValue when given a value registration", () => {
		const registration = {
			identifier: "test-value",
			value: 42,
		};

		const ticket = ProviderTicketMaster.createTicket(registration);

		expect(ticket).toBeDefined();
		expect(ticket.token).toBeDefined();
		expect(ticket.scope).toBe(ProviderScope.SINGLETON);
		// The ticket should be a ProviderTicketForValue instance
		expect("value" in ticket).toBe(true);
	});

	it("should create a ProviderTicketForValue with custom scope when specified", () => {
		const registration = {
			identifier: "test-value",
			scope: ProviderScope.TRANSIENT,
			value: "hello",
		};

		const ticket = ProviderTicketMaster.createTicket(registration);

		expect(ticket).toBeDefined();
		expect(ticket.scope).toBe(ProviderScope.TRANSIENT);
	});

	it("should create a ProviderTicketForFunction when given a function registration", () => {
		const registration = {
			identifier: "test-factory",
			factory: () => "created value",
		};

		const ticket = ProviderTicketMaster.createTicket(registration);

		expect(ticket).toBeDefined();
		expect(ticket.token).toBeDefined();
		expect(ticket.scope).toBe(ProviderScope.SINGLETON);
		// The ticket should be a ProviderTicketForFunction instance
		expect("factory" in ticket).toBe(true);
	});

	it("should create a ProviderTicketForAsyncFunction when given an async function registration", () => {
		const registration = {
			identifier: "test-async-factory",
			asyncFactory: async () => "async created value",
		};

		const ticket = ProviderTicketMaster.createTicket(registration);

		expect(ticket).toBeDefined();
		expect(ticket.token).toBeDefined();
		expect(ticket.scope).toBe(ProviderScope.SINGLETON);
		// The ticket should be a ProviderTicketForAsyncFunction instance
		expect("factory" in ticket).toBe(true);
	});

	it("should create a ProviderTicketForClass when given a class registration", () => {
		class TestClass {
			constructor(public value: string) {}
		}

		const valueTicket = ProviderTicketMaster.createTicket({
			identifier: "test-value",
			value: "test value",
		});

		const registration = {
			identifier: "test-class",
			class: TestClass,
			dependencies: [valueTicket],
		} as const;

		const ticket = ProviderTicketMaster.createTicket<typeof TestClass>(registration);

		expect(ticket).toBeDefined();
		expect(ticket.token).toBeDefined();
		expect(ticket.scope).toBe(ProviderScope.SINGLETON);
		// The ticket should be a ProviderTicketForClass instance
		expect("classConstructor" in ticket).toBe(true);
	});

	it("should create a ProviderTicketForClass with dependencies when provided", () => {
		class TestClass {
			constructor(
				public value: string,
				public count: number,
			) {}
		}

		// Create dependency tickets
		const valueTicket = ProviderTicketMaster.createTicketForValue(createProviderIdentifier("value"), "test value");
		const countTicket = ProviderTicketMaster.createTicketForValue(createProviderIdentifier("count"), 42);

		const registration = {
			identifier: "test-class",
			class: TestClass,
			dependencies: [valueTicket, countTicket],
		} as const;

		const ticket = ProviderTicketMaster.createTicket(registration);

		expect(ticket).toBeDefined();
		expect(ticket.token).toBeDefined();
		expect(ticket.scope).toBe(ProviderScope.SINGLETON);
		// The ticket should be a ProviderTicketForClass instance
		expect("classConstructor" in ticket).toBe(true);
		// Check that dependencies are properly set
		expect("dependencies" in ticket).toBe(true);
	});

	it("should handle symbol identifiers", () => {
		const symbolId = Symbol("test-symbol");
		const registration = {
			identifier: symbolId,
			value: "symbol value",
		};

		const ticket = ProviderTicketMaster.createTicket(registration);

		expect(ticket).toBeDefined();
		expect(ticket.token).toBeDefined();
	});

	it("should handle class type identifiers", () => {
		class TestClass {}

		const registration = {
			identifier: TestClass,
			class: TestClass,
		} as const;

		const ticket = ProviderTicketMaster.createTicket(registration);

		expect(ticket).toBeDefined();
		expect(ticket.token).toBeDefined();
	});

	it("should throw an error for invalid registration types", () => {
		const invalidRegistration = {
			identifier: "test",
			// Missing required properties for any valid registration type
		} as unknown as Parameters<typeof ProviderTicketMaster.createTicket>[0];

		expect(() => ProviderTicketMaster.createTicket(invalidRegistration)).toThrow("Invalid registration type");
	});
});
