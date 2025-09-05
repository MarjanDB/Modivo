import type { ClassType } from "@lib/utils/ClassType.js";
import type { Nominal } from "@lib/utils/Nominal.js";

export type DependencyTokenType = Nominal<symbol, "DependencyToken">;

export class DependencyTokenSymbolDefinition {
	public constructor(public readonly token: DependencyTokenType) {}
}

export class DependencyTokenStringDefinition {
	public constructor(public readonly token: DependencyTokenType) {}
}

export class DependencyTokenClassDefinition {
	public constructor(public readonly classType: ClassType<unknown>) {}
}

export type DependencyTokenDefinition = DependencyTokenSymbolDefinition | DependencyTokenStringDefinition | DependencyTokenClassDefinition;
