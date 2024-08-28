export interface Storage<Key extends string> {
	get(name: Key): string | null;
	set(name: Key, value: string, days?: number): void;
}

export class CookieClientStorage<Key extends string> implements Storage<Key> {
	get(name: Key): string | null {
		const nameEQ = `${name}=`;
		const cookies = document.cookie.split(';');

		for (let i = 0; i < cookies.length; i++) {
			let cookie = cookies[i];
			while (cookie?.charAt(0) === ' ') {
				cookie = cookie.substring(1, cookie.length);
			}
			if (cookie?.indexOf(nameEQ) === 0) {
				return cookie.substring(nameEQ.length, cookie.length);
			}
		}

		return null;
	}
	set(name: Key, value: string, days?: number): void {
		let expires = '';

		if (days) {
			const date = new Date();
			date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
			expires = `; expires=${date.toUTCString()}`;
		}

		document.cookie = `${name}=${value}${expires}; path=/`;
	}
}
