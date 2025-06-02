import { Settings } from "./types.js"

const DB_NAME = "mcDialogBuilder"
const DB_VERSION = 1
const STORE_NAME = "settings"

export const defaultSettings: Settings = {
	autoReload: true,
	highlightRequired: false,
	theme: "default",
	guiScale: 2,
	uiRatio: 30 // 30%
} as const

export function openSettingsDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION)

		request.addEventListener("upgradeneeded", () => {
			const db = request.result
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME)
			}
		})

		request.addEventListener("success", () => resolve(request.result))
		request.addEventListener("error",   () => reject(request.error))
	})
}

export function saveSettings(settings: Partial<Settings>) {
	openSettingsDB().then(db => {
		const tx = db.transaction(STORE_NAME, "readwrite")
		const store = tx.objectStore(STORE_NAME)
		const keys = Object.keys(settings) as (keyof Settings)[]

		keys.forEach(key => store.put(settings[key], key))
		tx.addEventListener("complete", () => db.close())
	})
}

export function loadSettings(): Promise<Settings> {
	return openSettingsDB().then(async db => {
		const tx = db.transaction(STORE_NAME, "readonly")
		const store = tx.objectStore(STORE_NAME)
		const keys = Object.keys(defaultSettings) as (keyof Settings)[]

		const settings = buildAsync(keys, key => getValue(store, key))
		db.close()
		return settings
	})
}

function getValue<Key extends keyof Settings>(store: IDBObjectStore, key: Key): Promise<Settings[Key]> {
	const req = store.get(key)

	return new Promise(resolve => {
		req.addEventListener("success", () => {
			resolve(req.result ?? defaultSettings[key])
		})

		req.addEventListener("error", () => {
			resolve(defaultSettings[key])
		})
	})
}

async function buildAsync<KeyArr extends Array<any>>(keys: KeyArr, cb: (key: KeyArr[number]) => Promise<any>) {
	const obj: any = {}

	for (const key of keys) {
		obj[key] = await cb(key)
	}

	return obj
}