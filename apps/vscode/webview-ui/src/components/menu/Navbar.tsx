import { HistoryIcon, PlusIcon, SettingsIcon, UserCircleIcon } from "lucide-react"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TaskServiceClient } from "@/services/grpc-client"
import { useExtensionState } from "../../context/ExtensionStateContext"

// Custom MCP Server Icon component using VSCode codicon
const McpServerIcon = ({ className, size }: { className?: string; size?: number }) => (
	<span
		className={`codicon codicon-server flex items-center ${className || ""}`}
		style={{ fontSize: size ? `${size}px` : "12.5px", marginBottom: "1px" }}
	/>
)

export const Navbar = () => {
	const { navigateToHistory, navigateToSettings, navigateToAccount, navigateToMcp, navigateToChat } = useExtensionState()

	const SETTINGS_TABS = useMemo(
		() => [
			{
				id: "chat",
				name: "Chat",
				tooltip: "New Task",
				icon: PlusIcon,
				navigate: () => {
					// Close the current task, then navigate to the chat view
					TaskServiceClient.clearTask({})
						.catch((error) => {
							console.error("Failed to clear task:", error)
						})
						.finally(() => navigateToChat())
				},
			},
			{
				id: "mcp",
				name: "MCP",
				tooltip: "MCP Servers",
				icon: McpServerIcon,
				navigate: navigateToMcp,
			},
			{
				id: "history",
				name: "History",
				tooltip: "History",
				icon: HistoryIcon,
				navigate: navigateToHistory,
			},
			{
				id: "account",
				name: "Account",
				tooltip: "Account",
				icon: UserCircleIcon,
				navigate: navigateToAccount,
			},
			{
				id: "settings",
				name: "Settings",
				tooltip: "Settings",
				icon: SettingsIcon,
				navigate: navigateToSettings,
			},
		],
		[navigateToAccount, navigateToChat, navigateToHistory, navigateToMcp, navigateToSettings],
	)

	return (
		<nav
			className="mx-4 mt-4 mb-2 flex items-center justify-between gap-3 rounded-2xl border border-[var(--shell-border-soft)] bg-[color:var(--shell-surface-elevated)]/85 px-3 py-2 shadow-[var(--shell-shadow)] backdrop-blur-xl"
			id="cline-navbar-container">
			<div className="flex min-w-0 items-center gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--shell-accent-soft)] text-[color:var(--shell-accent)]">
					<span className="codicon codicon-sparkle text-lg" />
				</div>
				<div className="min-w-0">
					<div className="truncate text-sm font-semibold text-foreground">Kijox Workspace</div>
					<div className="truncate text-xs text-muted-foreground">Focused coding with a cleaner control surface</div>
				</div>
			</div>
			<div className="flex items-center gap-1.5">
			{SETTINGS_TABS.map((tab) => (
				<Tooltip key={`navbar-tooltip-${tab.id}`}>
					<TooltipContent side="bottom">{tab.tooltip}</TooltipContent>
					<TooltipTrigger asChild>
						<Button
							aria-label={tab.tooltip}
							className="h-9 rounded-xl border border-transparent px-2.5 text-muted-foreground hover:border-[var(--shell-border-soft)] hover:bg-[color:var(--shell-accent-soft)] hover:text-foreground"
							data-testid={`tab-${tab.id}`}
							key={`navbar-button-${tab.id}`}
							onClick={() => tab.navigate()}
							size="sm"
							variant="ghost">
							<div className="flex items-center gap-1.5">
								<tab.icon className="stroke-1 [svg]:size-4" size={18} />
								<span className="hidden text-xs font-medium md:inline">{tab.name}</span>
							</div>
						</Button>
					</TooltipTrigger>
				</Tooltip>
			))}
			</div>
		</nav>
	)
}
