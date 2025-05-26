import { previewDialog } from "./preview.js"
import { createElement, readFormData } from "./util.js"
import ValidationError from "./ValidationError.js"

export function createControls(form: HTMLFormElement): HTMLDivElement {
	const controls = createElement("div", { id: "controls" })

	const previewButton = createElement("button", { id: "preview-button" })
	previewButton.textContent = "Preview"
	previewButton.type = "button"
	previewButton.addEventListener("click", () => {
		previewDialog()
	})

	const copyButton = createElement("button", { id: "copy-button" })
	copyButton.textContent = "Copy to Clipboard"
	copyButton.type = "button"
	copyButton.addEventListener("click", () => {
		const data = readFormData(form)
		if (data instanceof ValidationError) {
			alert("ValidationError:\n" + data.message)
			return
		}
		const json = JSON.stringify(data)
		navigator.clipboard.writeText(json).then(() => {
			alert("Data copied to clipboard!")
		}).catch(err => {
			console.error("Failed to copy: ", err)
			alert("Failed to copy data to clipboard.")
		})
	})

	const downloadButton = createElement("button", { id: "download-button", textContent: "Download JSON" })
	downloadButton.type = "button"
	downloadButton.addEventListener("click", () => {
		const data = readFormData(form)
		if (data instanceof ValidationError) {
			alert("ValidationError:\n" + data.message)
			return
		}
		const json = JSON.stringify(data, null, "\t")
		const blob = new Blob([json], { type: "application/json" })
		const url = URL.createObjectURL(blob)

		const a = document.createElement("a")
		a.href = url
		a.download = "dialog_data.json"
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(url)
	})

	const autoReloadLabel = createElement("label", { id: "auto-reload-label", textContent: "Auto-reload preview" })
	const autoReloadCheckbox = createElement("input", { id: "auto-reload-checkbox" })
	autoReloadCheckbox.type = "checkbox"
	autoReloadCheckbox.checked = true
	autoReloadLabel.appendChild(autoReloadCheckbox)

	controls.appendChild(previewButton)
	controls.appendChild(copyButton)
	controls.appendChild(downloadButton)
	controls.appendChild(autoReloadLabel)

	return controls
}