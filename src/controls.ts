import { saveSettings } from "./idb.js"
import { previewDialog } from "./preview.js"
import { Settings } from "./types.js"
import { $, createElement, readFormData } from "./util.js"
import ValidationError from "./ValidationError.js"

export const THEMES = ["default", "light", "dark", "mcstacker", "mcstacker-nostalgia"] as const

export function createControls(form: HTMLFormElement, settings: Settings): HTMLDivElement {
	const controls = createElement("div", { id: "controls" })

	controls.ariaLabel = "Controls"

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
	autoReloadLabel.ariaLabel = "Auto-reload preview"
	autoReloadCheckbox.type = "checkbox"
	autoReloadCheckbox.checked = settings.autoReload
	autoReloadLabel.appendChild(autoReloadCheckbox)

	const highlightRequiredLabel = createElement("label", { id: "highlight-required-label", textContent: "Highlight required" })
	highlightRequiredLabel.ariaLabel = "Highlight required"
	const highlightRequiredCheckbox = createElement("input", { id: "highlight-required-checkbox" })
	highlightRequiredCheckbox.type = "checkbox"
	highlightRequiredCheckbox.checked = settings.highlightRequired
	highlightRequiredLabel.appendChild(highlightRequiredCheckbox)

	$("html").dataset.highlightRequired = settings.highlightRequired + ""
	highlightRequiredCheckbox.addEventListener("change", () => {
		$("html").dataset.highlightRequired = highlightRequiredCheckbox.checked ? "true" : "false"
	})

	const themeLabel = createElement("label", { id: "theme-label", textContent: "Theme" })
	const themeSelect = createElement("select", { id: "theme-select" })

	themeLabel.ariaLabel = "Theme"

	THEMES.forEach(theme => {
		const option = createElement("option", { value: theme, textContent: theme })
		if (theme === settings.theme) {
			option.selected = true
		}
		themeSelect.appendChild(option)
	})

	$("html").dataset.theme = settings.theme
	themeSelect.addEventListener("change", () => {
		const selectedTheme = themeSelect.value
		$("html").dataset.theme = selectedTheme
	})

	themeLabel.appendChild(themeSelect)

	const guiScaleLabel = createElement("label", { id: "gui-scale-label", textContent: "GUI Scale:" })
	const guiScaleInput = createElement("input", { id: "gui-scale-input" })

	guiScaleLabel.ariaLabel = "GUI Scale"

	guiScaleInput.type = "range"
	guiScaleInput.ariaLabel = "GUI Scale"
	guiScaleInput.min = "1"
	guiScaleInput.max = "5"
	guiScaleInput.step = "1"
	guiScaleInput.value = settings.guiScale.toString()

	$("html").style.setProperty("--gui-scale", settings.guiScale.toString())
	guiScaleInput.addEventListener("change", () => {
		const scale = parseInt(guiScaleInput.value, 10)
		setGuiScale(scale)
	})

	guiScaleLabel.appendChild(guiScaleInput)

	highlightRequiredCheckbox.addEventListener("change", saveCurrentSettings)
	themeSelect.addEventListener("change", saveCurrentSettings)
	guiScaleInput.addEventListener("change", saveCurrentSettings)
	autoReloadCheckbox.addEventListener("change", saveCurrentSettings)

	controls.appendChild(previewButton)
	controls.appendChild(copyButton)
	controls.appendChild(downloadButton)
	controls.appendChild(autoReloadLabel)
	controls.appendChild(highlightRequiredLabel)
	controls.appendChild(themeLabel)
	controls.appendChild(guiScaleLabel)

	return controls
}

function setGuiScale(scale: number): void {
	if (scale < 1) scale = 1
	if (scale > 5) scale = 5
	if (isNaN(scale)) scale = 3

	$("#gui-scale-input", "input").value = scale.toString()
	$("html").style.setProperty("--gui-scale", scale.toString())
}

function getCurrentSettings(): Omit<Settings, "uiRatio"> {
	return {
		highlightRequired: $("#highlight-required-checkbox", "input").checked,
		theme: $("#theme-select", "select").value as typeof THEMES[number],
		guiScale: parseInt($("#gui-scale-input", "input").value, 10),
		autoReload: $("#auto-reload-checkbox", "input").checked
	}
}

function saveCurrentSettings() {
	saveSettings(getCurrentSettings())
}