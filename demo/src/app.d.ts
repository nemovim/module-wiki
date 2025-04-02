// See https://svelte.dev/docs/kit/types#app.d.ts
import type { User } from 'module-wiki';

// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			fullTitle: string,
		}
		interface Locals {
			user: User
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
