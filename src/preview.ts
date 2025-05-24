import { createElement, readFormData } from "./util.js"

export function previewDialog() {
	const form = document.getElementById("dialog") as HTMLDetailsElement
	const preview = document.getElementById("preview") as HTMLDivElement
	const dialogData = readFormData(form)
	preview.innerHTML = "" // Clear previous preview content

	console.log("Dialog Data:", dialogData)
	
	const header = createHeader(dialogData.title)
	const body = createBody(dialogData)
	const footer = createFooter(dialogData)
	
	preview.appendChild(header)
	preview.appendChild(body)
	preview.appendChild(footer)
}

function createHeader(title: string) {
	const element = createElement("div", { id: "preview-header" })
	const titleElement = createElement("span", { id: "preview-title" })

	titleElement.textContent = title

	element.appendChild(titleElement)
	return element
}

function createBody(dialogData: any) {
	const element = createElement("div", { id: "preview-body" })
	const bodyContent = document.createElement("p")

	bodyContent.textContent = "TODO"
	element.appendChild(bodyContent)


	return element
}

function createFooter(dialogData: any) {
	const element = createElement("div", { id: "preview-footer" })

	return element
}