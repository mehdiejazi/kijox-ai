import { EmptyRequest } from "@shared/proto/cline/common"
import ClineLogoSanta from "@/assets/ClineLogoSanta"
import ClineLogoTired from "@/assets/ClineLogoTired"
import ClineLogoVariable from "@/assets/ClineLogoVariable"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { UiServiceClient } from "@/services/grpc-client"

interface HomeHeaderProps {
	shouldShowQuickWins?: boolean
}

const HomeHeader = ({ shouldShowQuickWins = false }: HomeHeaderProps) => {
	const { environment, lazyTeammateModeEnabled } = useExtensionState()

	const handleTakeATour = async () => {
		try {
			await UiServiceClient.openWalkthrough(EmptyRequest.create())
		} catch (error) {
			console.error("Error opening walkthrough:", error)
		}
	}

	// Lazy Teammate Mode takes priority, then December festive logo, then default
	const isDecember = new Date().getMonth() === 11 // 11 = December (0-indexed)
	const LogoComponent = lazyTeammateModeEnabled ? ClineLogoTired : isDecember ? ClineLogoSanta : ClineLogoVariable
	const headingText = lazyTeammateModeEnabled ? "I guess I'm here to help" : "What can I do for you?"

	return (
		<div className="mx-5 mt-5 mb-6 rounded-[28px] border border-[var(--shell-border-soft)] bg-[color:var(--shell-surface-elevated)]/80 px-6 py-7 shadow-[var(--shell-shadow)] backdrop-blur-xl">
			<div className="mb-6 flex items-start justify-between gap-4">
				<div className="flex min-w-0 items-center gap-4">
					<div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[color:var(--shell-accent-soft)]/90 ring-1 ring-[var(--shell-border-soft)]">
						<LogoComponent className="size-12" environment={environment} />
					</div>
					<div className="min-w-0">
						<div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--shell-border-soft)] bg-[color:var(--shell-accent-soft)] px-3 py-1 text-[11px] font-semibold text-[color:var(--shell-accent)]">
							<span className="codicon codicon-rocket" />
							AI Workspace
						</div>
						<h1 className="m-0 text-xl font-bold tracking-tight text-foreground">{headingText}</h1>
						<p className="mt-2 mb-0 max-w-[580px] text-sm leading-6 text-muted-foreground">
							Use the workspace as a command center for coding, debugging, project history, and task execution without
							leaving the editor flow.
						</p>
					</div>
				</div>
				<div className="hidden rounded-2xl border border-[var(--shell-border-soft)] bg-[color:var(--shell-surface)]/80 px-4 py-3 text-left md:block">
					<div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Workflow</div>
					<div className="mt-2 text-sm font-medium text-foreground">Prompt, inspect, run, verify</div>
				</div>
			</div>
			{shouldShowQuickWins && (
				<div className="mt-2">
					<button
						className="flex items-center gap-2 rounded-2xl border border-[var(--shell-border-soft)] bg-[color:var(--shell-accent-soft)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-150 ease-in-out hover:bg-[color:var(--shell-accent-soft)]/70 cursor-pointer"
						onClick={handleTakeATour}
						type="button">
						Take a Tour
						<span className="codicon codicon-play scale-90" />
					</button>
				</div>
			)}
		</div>
	)
}

export default HomeHeader
