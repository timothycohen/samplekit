/* eslint-disable no-console */
import { browser } from '$app/environment';
import type { TocItem } from '$lib/nav';

type FlatTocItem = {
	title: string;
	href: string;
	node: Element;
};

const flatten = (tocItems: TocItem[]): FlatTocItem[] => {
	const flatItems: FlatTocItem[] = [];
	for (const item of tocItems) {
		const { children, href, title } = item;
		const id = href.split('#')[1];
		if (!id) {
			console.error('Invalid href: ', href);
			continue;
		}
		const node = document.getElementById(id);
		if (!node) {
			console.error('No element found with id: ', id);
			continue;
		}
		flatItems.push({ title, href, node });
		if (children) flatItems.push(...flatten(children));
	}
	return flatItems;
};

export class TocObserver {
	#states: Record<string, true | null> = $state({});
	#flattened: FlatTocItem[] = [];
	#elementsList: [Element, /* targetHref */ string, /* isVisible */ boolean][] = [];
	#observer: IntersectionObserver | null = null;

	#init(tocItems: TocItem[], wrappingSelector: string) {
		this.#states = {};
		this.#flattened = flatten(tocItems);
		this.#elementsList = [];
		this.#observer = null;
		if (!browser) return;

		const wrappingElement = document.querySelector(wrappingSelector);
		if (wrappingElement === null) {
			return console.error('No element found with the selector: ', wrappingSelector);
		}

		if (!this.#flattened.length) {
			return console.error('No elements found');
		}

		const elList = ([] as Element[]).slice.call(wrappingElement.getElementsByTagName('*'));
		elList.splice(0, elList.indexOf(this.#flattened[0]!.node));
		let currentHeader = -1;
		for (const el of elList) {
			if (this.#flattened.findIndex((f) => f.node === el) !== -1) {
				currentHeader++;
				this.#elementsList.push([el, this.#flattened[currentHeader]!.href, false]);
			} else if (el.children.length === 0) {
				this.#elementsList.push([el, this.#flattened[currentHeader]!.href, false]);
			}
		}
	}

	#observe() {
		const observer = new IntersectionObserver((entries) => {
			for (let i = 0; i < entries.length; i++) {
				const el = this.#elementsList.find((e) => e[0] === entries[i]!.target)!;
				el[2] = entries[i]!.intersectionRatio >= 0.01;
			}
			const visibleHrefs = new Set(this.#elementsList.filter((e) => e[2]).map((e) => e[1]));
			for (const { href } of this.#flattened) {
				if (visibleHrefs.has(href)) this.#states[href] = true;
				else this.#states[href] = null;
			}
		});
		this.#observer = observer;
		this.#elementsList.forEach(([el]) => observer.observe(el));
	}

	disconnect() {
		this.#observer?.disconnect();
		this.#observer = null;
	}

	observe(a: { tocTree: TocItem[]; wrappingSelector: string }) {
		this.disconnect();
		this.#init(a.tocTree, a.wrappingSelector);
		this.#observe();
	}

	isActive = (href: string) => {
		return this.#states[href] ?? null;
	};
}
