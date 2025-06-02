import { saveSettings } from "./idb.js"
import { createElement } from "./util.js"

export function createDraggableBorder(leftDiv: HTMLElement): void {
	const draggableBorder = createElement("div", { id: "draggable-border" })

	let isDragging = false
	let startX = 0, startLeftWidthVW = 0

	function startDragging(e: MouseEvent) {
		isDragging = true
		startX = e.clientX
		startLeftWidthVW = pxToVw(leftDiv.offsetWidth)
		draggableBorder.classList.add("dragging")
		document.body.style.cursor = "col-resize"
		document.body.style.userSelect = "none"
		e.preventDefault()
	}

	function updatePosition(x: number): number | undefined {
		if (!isDragging) return 

		const deltaX = x - startX
		const deltaVW = pxToVw(deltaX)

		let newLeftWidthVW = startLeftWidthVW + deltaVW

		const minVW = pxToVw(100)
		newLeftWidthVW = Math.max(newLeftWidthVW, minVW)
		newLeftWidthVW = Math.min(newLeftWidthVW, 100 - minVW)

		leftDiv.style.width = `${newLeftWidthVW}vw`
		return newLeftWidthVW
	}

	function finishDragging(e: MouseEvent) {
		if (!isDragging) return
		const vw = updatePosition(e.clientX)
		saveSettings({ uiRatio: vw })

		isDragging = false

		draggableBorder.classList.remove("dragging")
		document.body.style.cursor = ""
		document.body.style.userSelect = ""
	}

	draggableBorder.tabIndex = 0

	draggableBorder.addEventListener("keydown", e => {
		const currentWidth = pxToVw(leftDiv.offsetWidth)
		let newWidth = currentWidth

		switch (e.code) {
			case "ArrowLeft":
			case "KeyA":
				newWidth -= 5
				break

			case "ArrowRight":
			case "KeyD":
				newWidth += 5
				break
		}

		const minVW = pxToVw(100)
		newWidth = Math.max(newWidth, minVW)
		newWidth = Math.min(newWidth, 100 - minVW)

		leftDiv.style.width = `${newWidth}vw`
		saveSettings({ uiRatio: newWidth })
	})

	draggableBorder.addEventListener("mousedown", startDragging)

	document.addEventListener("mousemove", e => updatePosition(e.clientX))

	document.addEventListener("mouseup", finishDragging)

	document.addEventListener("mouseleave", finishDragging)

	document.body.appendChild(draggableBorder)
}

function pxToVw(px: number): number {
	return (px / window.innerWidth) * 100
}

function vwtoPx(vw: number): number {
	return (vw / 100) * window.innerWidth
}