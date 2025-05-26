import { createElement } from "./util.js"

export function createDraggableBorder(leftDiv: HTMLElement): void {
	const draggableBorder = createElement("div", { id: "draggable-border" })

	let isDragging = false
	let startX = 0, startLeftWidthVW = 0

	draggableBorder.addEventListener("mousedown", e => {
		isDragging = true
		startX = e.clientX
		startLeftWidthVW = pxToVw(leftDiv.offsetWidth)
		draggableBorder.classList.add("dragging")
		document.body.style.cursor = "col-resize"
		document.body.style.userSelect = "none"
		e.preventDefault()
	})

	document.addEventListener("mousemove", e => {
		if (!isDragging) return

		const deltaX = e.clientX - startX
		const deltaVW = pxToVw(deltaX)

		let newLeftWidthVW = startLeftWidthVW + deltaVW

		const minVW = pxToVw(100)
		newLeftWidthVW = Math.max(newLeftWidthVW, minVW)
		newLeftWidthVW = Math.min(newLeftWidthVW, 100 - minVW)

		leftDiv.style.width = `${newLeftWidthVW}vw`
	})

	document.addEventListener("mouseup", () => {
		if (!isDragging) return
		isDragging = false

		draggableBorder.classList.remove("dragging")
		document.body.style.cursor = ""
		document.body.style.userSelect = ""
	})

	document.addEventListener("mouseleave", () => {
		if (!isDragging) return
		isDragging = false

		draggableBorder.classList.remove("dragging")
		document.body.style.cursor = ""
		document.body.style.userSelect = ""
	})

	document.body.appendChild(draggableBorder)
}

function pxToVw(px: number): number {
	return (px / window.innerWidth) * 100
}

function vwtoPx(vw: number): number {
	return (vw / 100) * window.innerWidth
}