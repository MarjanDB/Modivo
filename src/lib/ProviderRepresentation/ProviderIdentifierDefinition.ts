import type { ClassType } from "@lib/utils/ClassType.js";
import type { Nominal } from "@lib/utils/Nominal.js";

export type DependencyTokenType = Nominal<symbol, "DependencyToken">;

export class ProviderIdentifierAsSymbol {
	public constructor(public readonly identifier: DependencyTokenType) {}
}

export class ProviderIdentifierAsString {
	public constructor(public readonly identifier: string) {}
}

export class ProviderIdentifierAsClass {
	public constructor(public readonly identifier: ClassType<any>) {}
}

export type ProviderIdentifier = ProviderIdentifierAsSymbol | ProviderIdentifierAsString | ProviderIdentifierAsClass;

export type PropertyIdentifier = ProviderIdentifierAsString | ProviderIdentifierAsSymbol;

export function createProviderIdentifier(identifier: string | symbol | ClassType<any>): ProviderIdentifier {
	if (typeof identifier === "string") {
		return new ProviderIdentifierAsString(identifier);
	}

	if (typeof identifier === "symbol") {
		return new ProviderIdentifierAsSymbol(identifier as DependencyTokenType);
	}

	return new ProviderIdentifierAsClass(identifier);
}
