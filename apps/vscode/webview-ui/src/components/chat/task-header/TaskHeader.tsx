import { ClineMessage } from "@shared/ExtensionMessage"
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react"
import Thumbnails from "@/components/common/Thumbnails"
import { getModeSpecificFields, normalizeApiConfiguration } from "@/components/settings/utils/providerUtils"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { cn } from "@/lib/utils"
import { getEnvironmentColor } from "@/utils/environmentColors"
import CopyTaskButton from "./buttons/CopyTaskButton"
import DeleteTaskButton from "./buttons/DeleteTaskButton"
import NewTaskButton from "./buttons/NewTaskButton"
import OpenDiskConversationHistoryButton from "./buttons/OpenDiskConversationHistoryButton"
import { CheckpointError } from "./CheckpointError"
import ContextWindow from "./ContextWindow"
import { FocusChain } from "./FocusChain"
import { highlightText } from "./Highlights"

const IS_DEV = process.env.IS_DEV === '"true"'
interface TaskHeaderProps {
	task: ClineMessage
	tokensIn: number
	tokensOut: number
	doesModelSupportPromptCache: boolean
	cacheWrites?: number
	cacheReads?: number
	totalCost: number
	lastApiReqTotalTokens?: number
	lastProgressMessageText?: string
	showFocusChainPlaceholder?: boolean
	onClose: () => void
	onSendMessage?: (command: string, files: string[], images: string[]) => void
}

const BUTTON_CLASS = "max-h-3 border-0 font-bold bg-transparent hover:opacity-100 text-foreground"

const TaskHeader: React.FC<TaskHeaderProps> = ({
	task,
	tokensIn,
	tokensOut,
	cacheWrites,
	cacheReads,
	totalCost,
	lastApiReqTotalTokens,
	lastProgressMessageText,
	showFocusChainPlaceholder,
	onClose,
	onSendMessage,
}) => {
	const {
		apiConfiguration,
		currentTaskItem,
		checkpointManagerErrorMessage,
		focusChainSettings,
		navigateToSettings,
		mode,
		expandTaskHeader: isTaskExpanded,
		setExpandTaskHeader: setIsTaskExpanded,
		environment,
	} = useExtensionState()

	const [isHighlightedTextExpanded, setIsHighlightedTextExpanded] = useState(false)
	const [isTextOverflowing, setIsTextOverflowing] = useState(false)
	const highlightedTextRef = React.useRef<HTMLDivElement>(null)

	const highlightedText = useMemo(() => highlightText(task.text, false), [task.text])

	// Check if text overflows the container (i.e., needs clamping)
	useLayoutEffect(() => {
		const el = highlightedTextRef.current
		if (el && isTaskExpanded && !isHighlightedTextExpanded) {
			// Check if content height exceeds the max-height
			setIsTextOverflowing(el.scrollHeight > el.clientHeight)
		}
	}, [task.text, isTaskExpanded, isHighlightedTextExpanded])

	// Handle click outside to collapse
	React.useEffect(() => {
		if (!isHighlightedTextExpanded) {
			return
		}

		const handleClickOutside = (event: MouseEvent) => {
			if (highlightedTextRef.current && !highlightedTextRef.current.contains(event.target as Node)) {
				setIsHighlightedTextExpanded(false)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => document.removeEventListener("mousedown", handleClickOutside)
	}, [isHighlightedTextExpanded])

	// Simplified computed values
	const { selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, mode)
	const modeFields = getModeSpecificFields(apiConfiguration, mode)

	const isCostAvailable =
		(totalCost &&
			modeFields.apiProvider === "openai" &&
			modeFields.openAiModelInfo?.inputPrice &&
			modeFields.openAiModelInfo?.outputPrice) ||
		(modeFields.apiProvider !== "vscode-lm" &&
			modeFields.apiProvider !== "ollama" &&
			modeFields.apiProvider !== "lmstudio" &&
			modeFields.apiProvider !== "openai-codex") // Subscription-based, no per-token costs

	// Event handlers
	const toggleTaskExpanded = useCallback(() => setIsTaskExpanded(!isTaskExpanded), [setIsTaskExpanded, isTaskExpanded])

	const handleCheckpointSettingsClick = useCallback(() => {
		navigateToSettings("features")
	}, [navigateToSettings])

	const environmentBorderColor = getEnvironmentColor(environment, "border")

	return (
		<div className="flex flex-col gap-3 px-4 py-3">
			{/* Display Checkpoint Error */}
			<CheckpointError
				checkpointManagerErrorMessage={checkpointManagerErrorMessage}
				handleCheckpointSettingsClick={handleCheckpointSettingsClick}
			/>
			{/* Task Header */}
			<div
				className={cn(
					"relative z-10 flex cursor-pointer flex-col gap-2 overflow-hidden rounded-[24px] border px-4 py-3 shadow-[var(--shell-shadow)] transition-all",
					{
						"bg-[color:var(--shell-surface-elevated)]/92 opacity-100": isTaskExpanded,
						"bg-[color:var(--shell-surface)]/76 hover:bg-[color:var(--shell-surface-elevated)]/86": !isTaskExpanded,
					},
				)}
				style={{
					borderColor: environmentBorderColor || "var(--shell-border-soft)",
				}}>
				{/* Task Title */}
				<div
					aria-label={isTaskExpanded ? "Collapse task header" : "Expand task header"}
					className="flex justify-between items-center cursor-pointer"
					onClick={toggleTaskExpanded}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault()
							e.stopPropagation()
							toggleTaskExpanded()
						}
					}}
					tabIndex={0}>
					<div className="flex items-center justify-between gap-2">
						{isTaskExpanded ? <ChevronDownIcon size="16" /> : <ChevronRightIcon size="16" />}
						{isTaskExpanded && (
							<div className="mx-2 mt-1 flex cursor-pointer justify-end gap-2 opacity-80">
								<CopyTaskButton className={BUTTON_CLASS} taskText={task.text} />
								<DeleteTaskButton
									className={BUTTON_CLASS}
									taskId={currentTaskItem?.id}
									taskSize={currentTaskItem?.size}
								/>
								{/* Only visible in development mode */}
								{IS_DEV && (
									<OpenDiskConversationHistoryButton className={BUTTON_CLASS} taskId={currentTaskItem?.id} />
								)}
							</div>
						)}
					</div>
					<div className="flex min-w-0 grow items-center justify-between gap-2 select-none">
						{!isTaskExpanded && (
							<div className="min-w-0 grow overflow-hidden text-ellipsis whitespace-nowrap">
								<div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
									Active Task
								</div>
								<span className="ph-no-capture text-sm font-medium text-foreground">{highlightedText}</span>
							</div>
						)}
					</div>
					<div className="inline-flex shrink-0 select-none items-center justify-end gap-2">
						{isCostAvailable && (
							<div
								className="inline-flex shrink-0 items-center rounded-full border border-[var(--shell-border-soft)] bg-[color:var(--shell-accent-soft)] px-2 py-1 text-[color:var(--shell-accent)]"
								id="price-tag">
								<span className="text-xs font-semibold sm:text-sm">${totalCost?.toFixed(4)}</span>
							</div>
						)}
						<NewTaskButton className={BUTTON_CLASS} onClick={onClose} />
					</div>
				</div>

				{/* Expand/Collapse Task Details */}
				{isTaskExpanded && (
					<div className="flex flex-col break-words" key={`task-details-${currentTaskItem?.id}`}>
						<div
							className={cn(
								"ph-no-capture relative mt-1 whitespace-pre-wrap break-words px-0.5 text-sm leading-6 text-foreground/92",
								"max-h-[4.5rem] overflow-hidden",
								{
									"max-h-[25vh] overflow-y-auto scroll-smooth": isHighlightedTextExpanded,
									"cursor-pointer": isTextOverflowing,
								},
							)}
							onClick={() => isTextOverflowing && setIsHighlightedTextExpanded(true)}
							ref={highlightedTextRef}
							style={
								!isHighlightedTextExpanded && isTextOverflowing
									? {
											WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
											maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
										}
									: undefined
							}>
							{highlightedText}
						</div>

						{((task.images && task.images.length > 0) || (task.files && task.files.length > 0)) && (
							<div className="mt-2 rounded-2xl border border-[var(--shell-border-soft)] bg-[color:var(--shell-surface)]/72 p-2">
								<Thumbnails files={task.files ?? []} images={task.images ?? []} />
							</div>
						)}

						<div className="mt-2 rounded-2xl border border-[var(--shell-border-soft)] bg-[color:var(--shell-surface)]/72 p-2">
							<ContextWindow
								cacheReads={cacheReads}
								cacheWrites={cacheWrites}
								contextWindow={selectedModelInfo?.contextWindow}
								lastApiReqTotalTokens={lastApiReqTotalTokens}
								onSendMessage={onSendMessage}
								tokensIn={tokensIn}
								tokensOut={tokensOut}
								useAutoCondense={false} // Disable auto-condense configuration in UI for now
							/>
						</div>
					</div>
				)}
			</div>

			{/* Display Focus Chain To-Do List */}
			{focusChainSettings.enabled && (
				<FocusChain
					currentTaskItemId={currentTaskItem?.id}
					lastProgressMessageText={lastProgressMessageText}
					showPlaceholderWhenEmpty={showFocusChainPlaceholder}
				/>
			)}
		</div>
	)
}

export default TaskHeader
