import { LRUCache } from "lru-cache"

export type ContextMessage = {
	role?: string
	content: string
}

export type RelevantFunctionMatch = {
	startLine: number
	endLine: number
	snippet: string
}

export const cache = new LRUCache<string, string>({
	max: 100,
})

export function slidingWindow<T>(messages: T[], size = 10): T[] {
	if (size <= 0) {
		return []
	}

	return messages.slice(-size)
}

export function compressLog(log: string, maxLines = 200): string {
	const seen = new Set<string>()
	const uniqueLines: string[] = []

	for (const line of log.split(/\r?\n/)) {
		const normalizedLine = line.trim()
		if (!normalizedLine || seen.has(normalizedLine)) {
			continue
		}

		seen.add(normalizedLine)
		uniqueLines.push(line)
	}

	return uniqueLines.slice(-maxLines).join("\n")
}

export function getRelevantFunction(source: string, query: string, contextRadius = 5): RelevantFunctionMatch | null {
	if (!source.trim() || !query.trim()) {
		return null
	}

	const lines = source.split(/\r?\n/)
	const matchIndex = lines.findIndex((line) => line.includes(query))
	if (matchIndex === -1) {
		return null
	}

	const startLine = Math.max(0, matchIndex - contextRadius)
	const endLine = Math.min(lines.length - 1, matchIndex + contextRadius)

	return {
		startLine: startLine + 1,
		endLine: endLine + 1,
		snippet: lines.slice(startLine, endLine + 1).join("\n"),
	}
}
