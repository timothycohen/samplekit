import { defineCtx } from '$lib/utils/client';
import { MenubarController } from './menubarController.svelte';

const [get, set] = defineCtx<MenubarController>();

const createMenubarCtx = (r_alwaysOpen: { value: boolean }) => {
	set(new MenubarController(r_alwaysOpen));
};

/**
 * Progressive enhancement for the menubar, controlling the visibility and bottom border.
 *
 * Example usage:
 * ```html
 * <div class="sticky w-full bg-app-bg" style="top: {menubar.topPx}px; height: var(--open-nav-height);">
 * ```
 *
 * `topPx` will become slightly negative (between `-navbarHeightPx` and `0px`) when scrolling down so the menubar gradually goes out of view.
 * Scrolling up will gradually show it again.
 *
 * If `r_alwaysOpen.value` is true, the scroll listener is removed so the menubar will always be visible regardless of scrolling.
 * This can be used to force it to stay visible when, for example, a sidebar is open.
 *
 * The boolean `border` property can be used to add a border depending on the scroll state.
 * If `r_alwaysOpen.value` is true, the border will be applied anytime `scrollY >= 1px`.
 * Otherwise, the border will be applied when the user scrolls past the menubar,
 * be visible when the user reveals the menubar again by scrolling up,
 * and be hidden again when the user scrolls to the top.
 */
const useMenubarCtx = get;

export { createMenubarCtx, useMenubarCtx };
