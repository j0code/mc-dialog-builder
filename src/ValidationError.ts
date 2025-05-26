export default class ValidationError{

	readonly message: string
	readonly path: string

	constructor(message: string, path: string) {
		this.path = path.replaceAll("-", ".")
		this.message = message.replaceAll("%s", this.path)
	}

	toString() {
		return this.message
	}

	get [Symbol.toStringTag]() {
		return this.message
	}

}