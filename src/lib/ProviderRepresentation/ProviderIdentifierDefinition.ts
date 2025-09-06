import type { ClassType } from "@lib/utils/ClassType.js";
import type { Nominal } from "@lib/utils/Nominal.js";

export type DependencyTokenType = Nominal<symbol, "DependencyToken">;

export class ProviderIdentifierAsSymbol {
	public constructor(public readonly token: DependencyTokenType) {}
}

export class ProviderIdentifierAsString {
	public constructor(public readonly token: string) {}
}

export class ProviderIdentifierAsClass {
	public constructor(public readonly classType: ClassType<unknown>) {}
}

export type ProviderIdentifier = ProviderIdentifierAsSymbol | ProviderIdentifierAsString | ProviderIdentifierAsClass;

export type PropertyIdentifier = ProviderIdentifierAsString | ProviderIdentifierAsSymbol;
