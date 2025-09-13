export interface ProviderOnResolvedSync {
	$afterResolvedSync(): void;
}

export interface ProviderOnResolvedAsync {
	$afterResolvedAsync(): Promise<void>;
}

export function isProviderOnResolvedSync(instance: unknown): instance is ProviderOnResolvedSync {
	return (
		instance !== null &&
		typeof instance === "object" &&
		"$afterResolvedSync" in instance &&
		typeof instance.$afterResolvedSync === "function"
	);
}

export function isProviderOnResolvedAsync(instance: unknown): instance is ProviderOnResolvedAsync {
	return (
		instance !== null &&
		typeof instance === "object" &&
		"$afterResolvedAsync" in instance &&
		typeof instance.$afterResolvedAsync === "function"
	);
}

// There are only really relevant for class providers,
// As factory providers are essentially the OnResolved method itself
export type ProviderOnResolved = ProviderOnResolvedSync | ProviderOnResolvedAsync;

export interface ProviderOnDestroyedSync {
	$beforeDestroyedSync(): void;
}

export function isProviderOnDestroyedSync(instance: unknown): instance is ProviderOnDestroyedSync {
	return (
		instance !== null &&
		typeof instance === "object" &&
		"$beforeDestroyedSync" in instance &&
		typeof instance.$beforeDestroyedSync === "function"
	);
}

export interface ProviderOnDestroyedAsync {
	$beforeDestroyedAsync(): Promise<void>;
}

export function isProviderOnDestroyedAsync(instance: unknown): instance is ProviderOnDestroyedAsync {
	return (
		instance !== null &&
		typeof instance === "object" &&
		"$beforeDestroyedAsync" in instance &&
		typeof instance.$beforeDestroyedAsync === "function"
	);
}

// These are relevant to both class and factory providers
export type ProviderOnDestroyed = ProviderOnDestroyedSync | ProviderOnDestroyedAsync;
