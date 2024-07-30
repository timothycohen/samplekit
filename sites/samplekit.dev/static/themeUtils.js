// Compile this to /static/themeUtils.js and import into app.html to prevent FOUC
var STORAGE_KEY_THEME_DAY = 'theme_day';
var STORAGE_KEY_THEME_NIGHT = 'theme_night';
var STORAGE_KEY_THEME_SYNC_MODE = 'theme_sync_mode';
function getStorageClient(name) {
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
var normalizeThemeMode = function (val) {
    if (!val)
        return DEFAULT_THEME_SYNC_MODE;
    if (val === 'fixed_day' || val === 'fixed_night' || val === 'sync_system')
        return val;
    return DEFAULT_THEME_SYNC_MODE;
};
var normalizeThemeDay = function (name, getter) {
    var _a;
    if (!name)
        return DEFAULT_THEME_DAY;
    var scheme = getter("".concat(STORAGE_KEY_THEME_DAY, "_scheme"));
    if (!scheme)
        return DEFAULT_THEME_DAY;
    return (_a = THEMES.find(function (t) { return t.name === name && t.scheme === scheme; })) !== null && _a !== void 0 ? _a : DEFAULT_THEME_DAY;
};
var normalizeThemeNight = function (name, getter) {
    var _a;
    if (!name)
        return DEFAULT_THEME_NIGHT;
    var scheme = getter("".concat(STORAGE_KEY_THEME_NIGHT, "_scheme"));
    if (!scheme)
        return DEFAULT_THEME_NIGHT;
    return (_a = THEMES.find(function (t) { return t.name === name && t.scheme === scheme; })) !== null && _a !== void 0 ? _a : DEFAULT_THEME_NIGHT;
};
var getStoredThemeModeClient = function () {
    return normalizeThemeMode(getStorageClient(STORAGE_KEY_THEME_SYNC_MODE));
};
var getStoredThemeDayClient = function () {
    return normalizeThemeDay(getStorageClient("".concat(STORAGE_KEY_THEME_DAY, "_name")), getStorageClient);
};
var getStoredThemeNightClient = function () {
    return normalizeThemeNight(getStorageClient("".concat(STORAGE_KEY_THEME_NIGHT, "_name")), getStorageClient);
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
var setSystemSchemeOnDoc = function (systemScheme) {
    document.documentElement.setAttribute('data-prefer-scheme', systemScheme);
};
var initTheme = function () {
    var mode = getStoredThemeModeClient();
    var systemScheme = getSystemScheme();
    var appliedMode = mode === 'fixed_day' ? 'day' : mode === 'fixed_night' ? 'night' : systemScheme === 'dark' ? 'night' : 'day';
    var themeApplied = appliedMode === 'night' ? getStoredThemeNightClient() : getStoredThemeDayClient();
    setThemeOnDoc(themeApplied);
    setSystemSchemeOnDoc(systemScheme);
};
