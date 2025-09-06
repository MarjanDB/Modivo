import { ProviderScope } from "@lib/lib/enums/ProviderScope.js";
import type { ProviderIdentifier } from "@lib/lib/ProviderRepresentation/ProviderIdentifierDefinition.js";

// Helper type to create a tuple of dependency types that match factory parameters
type DependencyTypes<FactoryArgs extends readonly unknown[], Identifier extends ProviderIdentifier> = {
	[K in keyof FactoryArgs]:
		| ProviderTicketForValue<Identifier, ProviderScope, FactoryArgs[K]>
		| ProviderTicketForFunction<
				Identifier,
				ProviderScope,
				unknown[],
				(...args: unknown[]) => NonNullable<unknown>,
				NonNullable<FactoryArgs[K]>
		  >;
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

	// biome-ignore lint/suspicious/noExplicitAny: So compiler can correctly infer the type of the arguments
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
		...args: unknown[]
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

	// biome-ignore lint/suspicious/noExplicitAny: So compiler can correctly infer the type of the arguments
	public withClassConstructor<NewClassConstructor extends new (...args: any[]) => any>(
		classConstructor: NewClassConstructor,
		dependencies: DependencyTypes<ConstructorParameters<NewClassConstructor>, Identifier>,
	): ProviderTicketForClass<Identifier, Scope, NewClassConstructor, InstanceType<NewClassConstructor>> {
		return new ProviderTicketForClass(this.token, this.scope, classConstructor, dependencies);
	}
}

export class ProviderTicketMaster {
	private constructor() {}

	public static createTicketForValue<Identifier extends ProviderIdentifier, ReturnType>(
		token: Identifier,
		value: ReturnType,
	): ProviderTicketForValue<Identifier, typeof ProviderScope.SINGLETON, ReturnType> {
		return new ProviderTicketForValue(token, ProviderScope.SINGLETON, value);
	}

	public static createTicketForFunction<
		Identifier extends ProviderIdentifier,
		// biome-ignore lint/suspicious/noExplicitAny: So compiler can correctly infer the type of the arguments
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
		// biome-ignore lint/suspicious/noExplicitAny: So compiler can correctly infer the type of the arguments
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
			// biome-ignore lint/suspicious/noExplicitAny: So compiler can correctly infer the type of the arguments
			...args: any[]
			// biome-ignore lint/suspicious/noExplicitAny: So compiler can correctly infer the type of the arguments
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
