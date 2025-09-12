import { ProviderIdentifierAsString } from "@lib/lib/ProviderRepresentation/ProviderIdentifierDefinition.js";
import { ProviderTicketForClass, ProviderTicketMaster } from "@lib/lib/UsageImplementation/ProviderTicketMaster.js";

/**
 * These tests are mostly to validate the type safety of the ProviderTicketForClass class.
 * Asserts are dummy, they are not actually testing anything.
 */
describe("ProviderTicketForClass", () => {
	it("should be able to handle classes with no dependencies", () => {
		class TestClass {
			public value = 42;
		}

		const providerTicketForClass = ProviderTicketMaster.createTicketForClass(
			new ProviderIdentifierAsString("test"),
			TestClass,
			[],
		);

		expect(providerTicketForClass).toBeInstanceOf(ProviderTicketForClass);
	});

	it("should be able to handle classes with constructor parameters", () => {
		class TestClass {
			public constructor(public value: number) {}
		}

		const numberDependency = ProviderTicketMaster.createTicketForValue(
			new ProviderIdentifierAsString("numberDep"),
			42,
		);

		const providerTicketForClass = ProviderTicketMaster.createTicketForClass(
			new ProviderIdentifierAsString("test"),
			TestClass,
			[numberDependency],
		);

		expect(providerTicketForClass).toBeInstanceOf(ProviderTicketForClass);
	});

	it("should enforce dependencies to be of the correct type", () => {
		class TestClass {
			public constructor(
				public name: string,
				public value: number,
			) {}
		}

		const stringDependency = ProviderTicketMaster.createTicketForValue(
			new ProviderIdentifierAsString("stringDep"),
			"test",
		);

		const numberDependency = ProviderTicketMaster.createTicketForValue(
			new ProviderIdentifierAsString("numberDep"),
			42,
		);

		const providerTicketForClass = ProviderTicketMaster.createTicketForClass(
			new ProviderIdentifierAsString("test"),
			TestClass,
			[stringDependency, numberDependency],
		);

		expect(providerTicketForClass).toBeInstanceOf(ProviderTicketForClass);
	});

	it("should enforce dependencies to be of the correct type, enforced via const", () => {
		class TestClass {
			public constructor(public value: 42) {}
		}

		const numberDependency = ProviderTicketMaster.createTicketForValue(
			new ProviderIdentifierAsString("numberDep"),
			42 as const,
		);

		const providerTicketForClass = ProviderTicketMaster.createTicketForClass(
			new ProviderIdentifierAsString("test"),
			TestClass,
			[numberDependency],
		);

		expect(providerTicketForClass).toBeInstanceOf(ProviderTicketForClass);
	});

	it("should handle classes with complex constructor parameters", () => {
		class ComplexClass {
			public constructor(
				public config: { name: string; value: number },
				public callback: () => void,
			) {}
		}

		const configDependency = ProviderTicketMaster.createTicketForValue(
			new ProviderIdentifierAsString("configDep"),
			{ name: "test", value: 42 },
		);

		const callbackDependency = ProviderTicketMaster.createTicketForValue(
			new ProviderIdentifierAsString("callbackDep"),
			() => {},
		);

		const providerTicketForClass = ProviderTicketMaster.createTicketForClass(
			new ProviderIdentifierAsString("test"),
			ComplexClass,
			[configDependency, callbackDependency],
		);

		expect(providerTicketForClass).toBeInstanceOf(ProviderTicketForClass);
	});

	it("should handle classes that extend other classes", () => {
		class BaseClass {
			public constructor(public baseValue: string) {}
		}

		class ExtendedClass extends BaseClass {
			public constructor(
				baseValue: string,
				public extendedValue: number,
			) {
				super(baseValue);
			}
		}

		const stringDependency = ProviderTicketMaster.createTicketForValue(
			new ProviderIdentifierAsString("stringDep"),
			"base",
		);

		const numberDependency = ProviderTicketMaster.createTicketForValue(
			new ProviderIdentifierAsString("numberDep"),
			42,
		);

		const providerTicketForClass = ProviderTicketMaster.createTicketForClass(
			new ProviderIdentifierAsString("test"),
			ExtendedClass,
			[stringDependency, numberDependency],
		);

		expect(providerTicketForClass).toBeInstanceOf(ProviderTicketForClass);
	});

	it("should support withScope method", () => {
		class TestClass {
			public value = 42;
		}

		const originalTicket = ProviderTicketMaster.createTicketForClass(
			new ProviderIdentifierAsString("test"),
			TestClass,
			[],
		);

		const scopedTicket = originalTicket.withScope("TRANSIENT" as any);

		expect(scopedTicket).toBeInstanceOf(ProviderTicketForClass);
	});

	it("should support withClassConstructor method", () => {
		class OriginalClass {
			public value = 42;
		}

		class NewClass {
			public constructor(public name: string) {}
		}

		const originalTicket = ProviderTicketMaster.createTicketForClass(
			new ProviderIdentifierAsString("test"),
			OriginalClass,
			[],
		);

		const newClassTicket = originalTicket.withClassConstructor(NewClass, [
			ProviderTicketMaster.createTicketForValue(new ProviderIdentifierAsString("str"), "test"),
		]);

		expect(newClassTicket).toBeInstanceOf(ProviderTicketForClass);
	});

	it("should support withReturnType method", () => {
		interface ClassInterface {
			value: number;
		}

		class OriginalClass implements ClassInterface {
			public value = 42;
		}

		const originalTicket = ProviderTicketMaster.createTicketForClass(
			new ProviderIdentifierAsString("test"),
			OriginalClass,
			[],
		);

		// Should equal the interface type
		const newClassTicket = originalTicket.withReturnType<ClassInterface>();

		expect(newClassTicket).toBeInstanceOf(ProviderTicketForClass);
	});
});
