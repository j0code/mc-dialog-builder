import { NBTList } from "../types.js";

export default {
	type: "list",
	elementType: {
		type: "compound",
		children: {
			type: { type: "select", registry: "minecraft:text_component_type", required: true },
			color: { type: "string", placeholder: "Enter color (e.g. #FF0000)" },
			font: { type: "string", placeholder: "Enter font (e.g. minecraft:default)" },
			bold: { type: "boolean" },
			italic: { type: "boolean" },
			underlined: { type: "boolean" },
			strikethrough: { type: "boolean" },
			obfuscated: { type: "boolean" },
			shadow_color: {
				type: "tuple",
				elementType: { type: "number", min: 0, max: 1, step: 0.003921569 },
				labels: ["red", "green", "blue", "alpha"]
			},
			click_event: {
				type: "compound",
				children: {
					action: { type: "select", registry: "minecraft:click_event_type" }
				}
			},
			hover_event: {
				type: "compound",
				children: {
					action: { type: "select", registry: "minecraft:hover_event_type" }
				}
			}
		}
	}
} satisfies NBTList