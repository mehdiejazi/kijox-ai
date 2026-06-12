declare module "lru-cache" {
	export type LRUOptions<K, V> = {
		max?: number
	}

	export default class LRUCache<K, V> {
		constructor(options?: LRUOptions<K, V> | number)
		get(key: K): V | undefined
		set(key: K, value: V): this
		has(key: K): boolean
		del(key: K): void
		reset(): void
	}
}
