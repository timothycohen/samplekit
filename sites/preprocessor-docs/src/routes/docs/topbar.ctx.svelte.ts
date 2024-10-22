import { TopbarController } from '$lib/nav/topbar';
import { defineCtx } from '$lib/utils/client';

const [get, set] = defineCtx<TopbarController>();

const createTopbarCtx = (r_alwaysOpen: { value: boolean }) => {
	set(new TopbarController(r_alwaysOpen));
};

/**
 * Progressive enhancement for the topbar, controlling the visibility and bottom border.
 *
 * Example usage:
 * ```html
 * <div class="sticky w-full bg-app-bg" style="top: {topbar.topPx}px; height: var(--nav-height);">
 * ```
 *
 * `topPx` will become slightly negative (between `--full-nav-height` and `0px`) when scrolling down so the topbar gradually goes out of view.
 * Scrolling up will gradually show it again.
 *
 * If `r_alwaysOpen.value` is true, the scroll listener is removed so the topbar will always be visible regardless of scrolling.
 * This can be used to force it to stay visible when, for example, a sidebar is open.
 *
 * The boolean `border` property can be used to add a border depending on the scroll state.
 * If `r_alwaysOpen.value` is true, the border will be applied anytime `scrollY >= 1px`.
 * Otherwise, the border will be applied when the user scrolls past the topbar,
 * be visible when the user reveals the topbar again by scrolling up,
 * and be hidden again when the user scrolls to the top.
 */
const useTopbarCtx = get;

export { createTopbarCtx, useTopbarCtx };
