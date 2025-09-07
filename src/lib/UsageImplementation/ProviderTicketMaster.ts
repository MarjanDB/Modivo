/** biome-ignore-all lint/suspicious/noExplicitAny: So compiler can correctly infer the type of the arguments */
import { ProviderScope } from "@lib/lib/enums/ProviderScope.js";
import {
	createProviderIdentifier,
	type ProviderIdentifier,
} from "@lib/lib/ProviderRepresentation/ProviderIdentifierDefinition.js";
import type { ClassType } from "@lib/utils/ClassType.js";

// Helper type to create a tuple of dependency types that match factory parameters
export type DependencyTypes<FactoryArgs extends readonly unknown[], Identifier extends ProviderIdentifier> =
	| {
			[K in keyof FactoryArgs]:
				| ProviderTicketForValue<Identifier, ProviderScope, FactoryArgs[K]>
				| ProviderTicketForFunction<
						Identifier,
						ProviderScope,
						unknown[],
						(...args: unknown[]) => NonNullable<unknown>,
						NonNullable<FactoryArgs[K]>
				  >
				| ProviderTicketForAsyncFunction<
						Identifier,
						ProviderScope,
						unknown[],
						(...args: unknown[]) => Promise<NonNullable<unknown>>,
						Promise<NonNullable<FactoryArgs[K]>>
				  >
				| ProviderTicketForClass<Identifier, ProviderScope, new (...args: any[]) => any, FactoryArgs[K]>;
	  }
	| {
			readonly [K in keyof FactoryArgs]:
				| ProviderTicketForValue<Identifier, ProviderScope, FactoryArgs[K]>
				| ProviderTicketForFunction<
						Identifier,
						ProviderScope,
						unknown[],
						(...args: unknown[]) => NonNullable<unknown>,
						NonNullable<FactoryArgs[K]>
				  >
				| ProviderTicketForAsyncFunction<
						Identifier,
						ProviderScope,
						unknown[],
						(...args: unknown[]) => Promise<NonNullable<unknown>>,
						Promise<NonNullable<FactoryArgs[K]>>
				  >
				| ProviderTicketForClass<Identifier, ProviderScope, new (...args: any[]) => any, FactoryArgs[K]>;
	  };

export class ProviderTicketForValue<Identifier extends ProviderIdentifier, Scope extends ProviderScope, Value> {
	public constructor(
		public readonly token: Identifier,
		public readonly scope: Scope,
		public readonly value: Value,
	) {}

	public withScope<NewScope extends ProviderScope>(
		scope: NewScope,
	): ProviderTicketForValue<Identifier, NewScope, Value> {
		return new ProviderTicketForValue(this.token, scope, this.value);
	}

	public withValue<NewValue>(value: NewValue): ProviderTicketForValue<Identifier, Scope, NewValue> {
		return new ProviderTicketForValue(this.token, this.scope, value);
	}
}

export class ProviderTicketForFunction<
	Identifier extends ProviderIdentifier,
	Scope extends ProviderScope,
	FactoryArguments extends unknown[],
	FactorySignature extends (...args: FactoryArguments) => NonNullable<unknown>,
	FactoryReturn extends ReturnType<FactorySignature>,
> {
	public constructor(
		public readonly token: Identifier,
		public readonly scope: Scope,
		public readonly factory: FactorySignature,
		public readonly dependencies: DependencyTypes<Parameters<FactorySignature>, Identifier>,
	) {}

	public withScope<NewScope extends ProviderScope>(
		scope: NewScope,
	): ProviderTicketForFunction<Identifier, NewScope, FactoryArguments, FactorySignature, FactoryReturn> {
		return new ProviderTicketForFunction(this.token, scope, this.factory, this.dependencies);
	}

	public withFactory<NewFactorySignature extends (...args: unknown[]) => NonNullable<unknown>>(
		factory: NewFactorySignature,
		dependencies: DependencyTypes<Parameters<NewFactorySignature>, Identifier>,
	): ProviderTicketForFunction<
		Identifier,
		Scope,
		Parameters<NewFactorySignature>,
		NewFactorySignature,
		ReturnType<NewFactorySignature>
	> {
		return new ProviderTicketForFunction(this.token, this.scope, factory, dependencies);
	}
}

export class ProviderTicketForAsyncFunction<
	Identifier extends ProviderIdentifier,
	Scope extends ProviderScope,
	FactoryArguments extends unknown[],
	FactorySignature extends (...args: FactoryArguments) => Promise<NonNullable<unknown>>,
	FactoryReturn extends ReturnType<FactorySignature>,
> {
	public constructor(
		public readonly token: Identifier,
		public readonly scope: Scope,
		public readonly factory: FactorySignature,
		public readonly dependencies: DependencyTypes<Parameters<FactorySignature>, Identifier>,
	) {}

	public withScope<NewScope extends ProviderScope>(
		scope: NewScope,
	): ProviderTicketForAsyncFunction<Identifier, NewScope, FactoryArguments, FactorySignature, FactoryReturn> {
		return new ProviderTicketForAsyncFunction(this.token, scope, this.factory, this.dependencies);
	}

	public withFactory<NewFactorySignature extends (...args: any[]) => Promise<NonNullable<unknown>>>(
		factory: NewFactorySignature,
		dependencies: DependencyTypes<Parameters<NewFactorySignature>, Identifier>,
	): ProviderTicketForAsyncFunction<
		Identifier,
		Scope,
		Parameters<NewFactorySignature>,
		NewFactorySignature,
		ReturnType<NewFactorySignature>
	> {
		return new ProviderTicketForAsyncFunction(this.token, this.scope, factory, dependencies);
	}
}

export class ProviderTicketForClass<
	Identifier extends ProviderIdentifier,
	Scope extends ProviderScope,
	ClassConstructor extends new (
		...args: any[]
	) => unknown,
	ClassInstance extends InstanceType<ClassConstructor>,
> {
	public constructor(
		public readonly token: Identifier,
		public readonly scope: Scope,
		public readonly classConstructor: ClassConstructor,
		public readonly dependencies: DependencyTypes<ConstructorParameters<ClassConstructor>, Identifier>,
	) {}

	public withScope<NewScope extends ProviderScope>(
		scope: NewScope,
	): ProviderTicketForClass<Identifier, NewScope, ClassConstructor, ClassInstance> {
		return new ProviderTicketForClass(this.token, scope, this.classConstructor, this.dependencies);
	}

	public withClassConstructor<NewClassConstructor extends new (...args: any[]) => any>(
		classConstructor: NewClassConstructor,
		dependencies: DependencyTypes<ConstructorParameters<NewClassConstructor>, Identifier>,
	): ProviderTicketForClass<Identifier, Scope, NewClassConstructor, InstanceType<NewClassConstructor>> {
		return new ProviderTicketForClass(this.token, this.scope, classConstructor, dependencies);
	}
}

export type ProviderTicket<Identifier extends ProviderIdentifier, Scope extends ProviderScope, ReturnType> =
	| ProviderTicketForFunction<
			Identifier,
			Scope,
			any[],
			(...args: any[]) => NonNullable<ReturnType>,
			NonNullable<ReturnType>
	  >
	| ProviderTicketForAsyncFunction<
			Identifier,
			Scope,
			any[],
			(...args: any[]) => Promise<NonNullable<ReturnType>>,
			Promise<NonNullable<ReturnType>>
	  >
	| ProviderTicketForClass<Identifier, Scope, new (...args: any[]) => any, any>
	| ProviderTicketForValue<Identifier, Scope, ReturnType>;

export type TypeForRegisteringValue<Value> = {
	identifier: string | symbol;
	scope?: ProviderScope;
	value: Value;
};

export type TypeForRegisteringFunction<FactorySignature extends (...args: unknown[]) => NonNullable<unknown>> = {
	identifier: string | symbol;
	scope?: ProviderScope;
	factory: FactorySignature;
	dependencies: Parameters<FactorySignature> extends []
		? never
		: DependencyTypes<Parameters<FactorySignature>, ProviderIdentifier>;
};

export type TypeForRegisteringAsyncFunction<
	FactorySignature extends (...args: unknown[]) => Promise<NonNullable<unknown>>,
> = {
	identifier: string | symbol;
	scope?: ProviderScope;
	asyncFactory: FactorySignature;
	dependencies?: DependencyTypes<Parameters<FactorySignature>, ProviderIdentifier>;
};

export type TypeForRegisteringClass<ClassConstructor extends new (...args: any[]) => any> = {
	identifier: string | symbol | ClassType<unknown>;
	scope?: ProviderScope;
	class: ClassConstructor;
	dependencies?: DependencyTypes<ConstructorParameters<ClassConstructor>, ProviderIdentifier>;
};

export type TypeForRegisteringDependency =
	| TypeForRegisteringFunction<(...args: any[]) => NonNullable<unknown>>
	| TypeForRegisteringAsyncFunction<(...args: any[]) => Promise<NonNullable<unknown>>>
	| TypeForRegisteringClass<new (...args: any[]) => any>
	| TypeForRegisteringValue<any>;

export class ProviderTicketMaster {
	private constructor() {}

	// Type guards to distinguish between different registration types
	private static isValueRegistration(
		registration: TypeForRegisteringDependency,
	): registration is TypeForRegisteringValue<unknown> {
		return "value" in registration;
	}

	private static isFunctionRegistration(
		registration: TypeForRegisteringDependency,
	): registration is TypeForRegisteringFunction<(...args: any[]) => NonNullable<unknown>> {
		return "factory" in registration;
	}

	private static isAsyncFunctionRegistration(
		registration: TypeForRegisteringDependency,
	): registration is TypeForRegisteringAsyncFunction<(...args: any[]) => Promise<NonNullable<unknown>>> {
		return "asyncFactory" in registration;
	}

	private static isClassRegistration(
		registration: TypeForRegisteringDependency,
	): registration is TypeForRegisteringClass<new (...args: any[]) => any> {
		return "class" in registration;
	}

	// Factory signature
	public static createTicket<FactorySignature extends (...args: any[]) => NonNullable<unknown>>(
		registration: TypeForRegisteringFunction<FactorySignature>,
	): ProviderTicketForFunction<
		ProviderIdentifier,
		ProviderScope,
		Parameters<FactorySignature>,
		FactorySignature,
		ReturnType<FactorySignature>
	>;

	// Async factory signature
	public static createTicket<FactorySignature extends (...args: any[]) => Promise<NonNullable<unknown>>>(
		registration: TypeForRegisteringAsyncFunction<FactorySignature>,
	): ProviderTicketForAsyncFunction<
		ProviderIdentifier,
		ProviderScope,
		Parameters<FactorySignature>,
		FactorySignature,
		ReturnType<FactorySignature>
	>;

	// Class constructor signature
	public static createTicket<ClassConstructor extends new (...args: any[]) => any>(
		registration: TypeForRegisteringClass<ClassConstructor>,
	): ProviderTicketForClass<ProviderIdentifier, ProviderScope, ClassConstructor, InstanceType<ClassConstructor>>;

	// Value signature
	public static createTicket<Value>(
		registration: TypeForRegisteringValue<Value>,
	): ProviderTicketForValue<ProviderIdentifier, ProviderScope, Value>;

	// Generic signature / Implementation
	public static createTicket(
		registration: TypeForRegisteringDependency,
	): ProviderTicket<ProviderIdentifier, ProviderScope, unknown> {
		const identifier = createProviderIdentifier(registration.identifier);
		const scope = registration.scope ?? ProviderScope.SINGLETON;

		if (ProviderTicketMaster.isValueRegistration(registration)) {
			const ticket = ProviderTicketMaster.createTicketForValue(identifier, registration.value);
			return scope !== ProviderScope.SINGLETON ? ticket.withScope(scope) : ticket;
		}

		if (ProviderTicketMaster.isFunctionRegistration(registration)) {
			const factory = registration.factory;
			const dependencies = registration.dependencies || [];
			const ticket = ProviderTicketMaster.createTicketForFunction(
				identifier,
				factory,
				dependencies as DependencyTypes<Parameters<typeof factory>, typeof identifier>,
			);
			return scope !== ProviderScope.SINGLETON ? ticket.withScope(scope) : ticket;
		}

		if (ProviderTicketMaster.isAsyncFunctionRegistration(registration)) {
			const asyncFactory = registration.asyncFactory;
			const dependencies = registration.dependencies || [];
			const ticket = ProviderTicketMaster.createTicketForAsyncFunction(
				identifier,
				asyncFactory,
				dependencies as DependencyTypes<Parameters<typeof asyncFactory>, typeof identifier>,
			);
			return scope !== ProviderScope.SINGLETON ? ticket.withScope(scope) : ticket;
		}

		if (ProviderTicketMaster.isClassRegistration(registration)) {
			const classConstructor = registration.class;
			const dependencies = registration.dependencies || [];
			const ticket = ProviderTicketMaster.createTicketForClass(
				identifier,
				classConstructor,
				dependencies as DependencyTypes<ConstructorParameters<typeof classConstructor>, typeof identifier>,
			);
			return scope !== ProviderScope.SINGLETON ? ticket.withScope(scope) : ticket;
		}

		throw new Error("Invalid registration type");
	}

	public static createTicketForValue<Identifier extends ProviderIdentifier, ReturnType>(
		token: Identifier,
		value: ReturnType,
	): ProviderTicketForValue<Identifier, typeof ProviderScope.SINGLETON, ReturnType> {
		return new ProviderTicketForValue(token, ProviderScope.SINGLETON, value);
	}

	public static createTicketForFunction<
		Identifier extends ProviderIdentifier,
		FactorySignature extends (...args: any[]) => NonNullable<unknown>,
	>(
		token: Identifier,
		factory: FactorySignature,
		dependencies: DependencyTypes<Parameters<FactorySignature>, Identifier>,
	): ProviderTicketForFunction<
		Identifier,
		typeof ProviderScope.SINGLETON,
		Parameters<FactorySignature>,
		FactorySignature,
		ReturnType<FactorySignature>
	> {
		return new ProviderTicketForFunction(token, ProviderScope.SINGLETON, factory, dependencies);
	}

	public static createTicketForAsyncFunction<
		Identifier extends ProviderIdentifier,
		FactorySignature extends (...args: any[]) => Promise<NonNullable<unknown>>,
	>(
		token: Identifier,
		factory: FactorySignature,
		dependencies: DependencyTypes<Parameters<FactorySignature>, Identifier>,
	): ProviderTicketForAsyncFunction<
		Identifier,
		typeof ProviderScope.SINGLETON,
		Parameters<FactorySignature>,
		FactorySignature,
		ReturnType<FactorySignature>
	> {
		return new ProviderTicketForAsyncFunction(token, ProviderScope.SINGLETON, factory, dependencies);
	}

	public static createTicketForClass<
		Identifier extends ProviderIdentifier,
		ClassConstructor extends new (
			...args: any[]
		) => any,
		ClassInstance extends InstanceType<ClassConstructor>,
	>(
		token: Identifier,
		classConstructor: ClassConstructor,
		dependencies: DependencyTypes<ConstructorParameters<ClassConstructor>, Identifier>,
	): ProviderTicketForClass<Identifier, typeof ProviderScope.SINGLETON, ClassConstructor, ClassInstance> {
		return new ProviderTicketForClass(token, ProviderScope.SINGLETON, classConstructor, dependencies);
	}
}
