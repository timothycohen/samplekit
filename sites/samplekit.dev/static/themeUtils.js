// Compile this to /static/themeUtils.js and import into app.html to prevent FOUC
var STORAGE_KEY_THEME_DAY = 'theme_day';
var STORAGE_KEY_THEME_NIGHT = 'theme_night';
var STORAGE_KEY_THEME_SYNC_MODE = 'theme_sync_mode';
function getStorage(name) {
    var nameEQ = "".concat(name, "=");
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        while ((cookie === null || cookie === void 0 ? void 0 : cookie.charAt(0)) === ' ') {
            cookie = cookie.substring(1, cookie.length);
        }
        if ((cookie === null || cookie === void 0 ? void 0 : cookie.indexOf(nameEQ)) === 0) {
            return cookie.substring(nameEQ.length, cookie.length);
        }
    }
    return null;
}
function setStorage(name, value, days) {
    var expires = '';
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=".concat(date.toUTCString());
    }
    document.cookie = "".concat(name, "=").concat(value).concat(expires, "; path=/");
}
/**
 * #### bellflower / amethyst
 * - success: Jade
 * - info: Cyan
 * - error: Ruby
 * - warning: Amber
 * - accent: Iris
 * - gray: Mauve
 *
 * #### daffodil / desert
 * - success: Green
 * - info: Blue
 * - error: Red
 * - warning: Yellow
 * - accent: Amber
 * - gray: Sand
 */
var THEMES = [
    { name: 'daffodil', scheme: 'light' },
    { name: 'desert', scheme: 'dark' },
    { name: 'bellflower', scheme: 'light' },
    { name: 'amethyst', scheme: 'dark' },
];
var DEFAULT_THEME_DAY = { name: 'bellflower', scheme: 'light' };
var DEFAULT_THEME_NIGHT = { name: 'amethyst', scheme: 'dark' };
var DEFAULT_THEME_SYNC_MODE = 'sync_system';
var getSystemScheme = function () {
    if (typeof window === 'undefined' || !window.matchMedia)
        return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};
var getStoredThemeMode = function () {
    if (typeof window === 'undefined')
        return DEFAULT_THEME_SYNC_MODE;
    var val = getStorage(STORAGE_KEY_THEME_SYNC_MODE);
    if (!val)
        return DEFAULT_THEME_SYNC_MODE;
    if (val === 'fixed_day' || val === 'fixed_night' || val === 'sync_system')
        return val;
    return DEFAULT_THEME_SYNC_MODE;
};
var getStoredThemeDay = function () {
    var _a;
    if (typeof window === 'undefined')
        return DEFAULT_THEME_DAY;
    var name = getStorage("".concat(STORAGE_KEY_THEME_DAY, "_name"));
    if (!name)
        return DEFAULT_THEME_DAY;
    var scheme = getStorage("".concat(STORAGE_KEY_THEME_DAY, "_scheme"));
    if (!scheme)
        return DEFAULT_THEME_DAY;
    return (_a = THEMES.find(function (t) { return t.name === name && t.scheme === scheme; })) !== null && _a !== void 0 ? _a : DEFAULT_THEME_DAY;
};
var getStoredThemeNight = function () {
    var _a;
    if (typeof window === 'undefined')
        return DEFAULT_THEME_NIGHT;
    var name = getStorage("".concat(STORAGE_KEY_THEME_NIGHT, "_name"));
    if (!name)
        return DEFAULT_THEME_NIGHT;
    var scheme = getStorage("".concat(STORAGE_KEY_THEME_NIGHT, "_scheme"));
    if (!scheme)
        return DEFAULT_THEME_NIGHT;
    return (_a = THEMES.find(function (t) { return t.name === name && t.scheme === scheme; })) !== null && _a !== void 0 ? _a : DEFAULT_THEME_NIGHT;
};
var setThemeOnDoc = function (_a) {
    var name = _a.name, scheme = _a.scheme;
    if (scheme === 'dark') {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        document.documentElement.dataset['theme'] = name;
    }
    else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
        document.documentElement.dataset['theme'] = name;
    }
};
var setThemeInStorage = function (_a) {
    var kind = _a.kind, theme = _a.theme;
    var storageKey = "theme_".concat(kind);
    setStorage("".concat(storageKey, "_name"), theme.name);
    setStorage("".concat(storageKey, "_scheme"), theme.scheme);
};
var setModeInStorage = function (mode) {
    setStorage(STORAGE_KEY_THEME_SYNC_MODE, mode);
};
var _initTheme = function () {
    var mode = getStoredThemeMode();
    var appliedMode = mode === 'fixed_day' ? 'day' : mode === 'fixed_night' ? 'night' : getSystemScheme() === 'dark' ? 'night' : 'day';
    var themeApplied = appliedMode === 'night' ? getStoredThemeNight() : getStoredThemeDay();
    setThemeOnDoc(themeApplied);
};
