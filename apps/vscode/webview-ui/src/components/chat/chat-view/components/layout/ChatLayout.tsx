import type React from "react"
import styled from "styled-components"

interface ChatLayoutProps {
	isHidden: boolean
	children: React.ReactNode
}

/**
 * Main layout container for the chat view
 * Provides the fixed positioning and flex layout structure
 */
export const ChatLayout: React.FC<ChatLayoutProps> = ({ isHidden, children }) => {
	return (
		<ChatLayoutContainer isHidden={isHidden}>
			<BackdropOrb className="orb-one" />
			<BackdropOrb className="orb-two" />
			<MainContent>{children}</MainContent>
		</ChatLayoutContainer>
	)
}

const ChatLayoutContainer = styled.div.withConfig({
	shouldForwardProp: (prop) => !["isHidden"].includes(prop),
})<{ isHidden: boolean }>`
	display: ${(props) => (props.isHidden ? "none" : "grid")};
	grid-template-rows: 1fr auto;
	overflow: hidden;
	padding: 14px 12px 10px;
	margin: 0;
	width: 100%;
	height: 100%;
	min-height: 100vh;
	position: relative;
	background:
		radial-gradient(circle at top right, color-mix(in srgb, var(--shell-glow) 100%, transparent) 0, transparent 24%),
		radial-gradient(circle at top left, color-mix(in srgb, var(--shell-accent-soft) 100%, transparent) 0, transparent 30%),
		var(--vscode-sideBar-background);
`

const MainContent = styled.div`
	display: flex;
	flex-direction: column;
	overflow: hidden;
	grid-row: 1;
	max-width: 1160px;
	width: 100%;
	margin: 0 auto;
	border-radius: 24px;
	border: 1px solid var(--shell-border-soft);
	background: linear-gradient(
		180deg,
		color-mix(in srgb, var(--shell-surface-elevated) 95%, transparent),
		color-mix(in srgb, var(--shell-surface) 94%, transparent)
	);
	box-shadow: var(--shell-shadow);
	backdrop-filter: blur(20px);
	position: relative;
`

const BackdropOrb = styled.div`
	position: absolute;
	width: 240px;
	height: 240px;
	border-radius: 999px;
	filter: blur(48px);
	opacity: 0.55;
	pointer-events: none;

	&.orb-one {
		top: -40px;
		left: -60px;
		background: color-mix(in srgb, var(--shell-accent) 36%, transparent);
	}

	&.orb-two {
		bottom: 120px;
		right: -40px;
		background: color-mix(in srgb, var(--vscode-terminal-ansiBlue) 24%, transparent);
	}
`
