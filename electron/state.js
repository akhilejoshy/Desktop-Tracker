export let isQuitingForUpdate = false;
export let latestVersion = null;

export function setQuitForUpdate(value) {
    isQuitingForUpdate = value;
}

export function setLatestVersion(v) {
    latestVersion = v;
}
