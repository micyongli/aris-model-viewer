const defaultExpires = 3600;

export function cleanKey(key) {
    localStorage.removeItem(key);
}

export function setLocalValue(key, value, sec) {
    const localPackage = {
        expireDate: Date.now(),
        data: value,
    };
    let defaultSec = defaultExpires
    if (typeof sec === 'number') {
        defaultSec = sec;
    }
    localPackage.expireDate += defaultSec * 1000;
    localStorage.setItem(key, JSON.stringify(localPackage));
}


export function getLocalValue(key) {
    const str = localStorage.getItem(key);
    if (!str) {
        return;
    }
    const localObject = JSON.parse(str);

    if (typeof localObject['expireDate'] === 'number') {
        const now = Date.now();
        if (now >= localObject['expireDate']) {
            return;
        }
        return localObject['data'];
    }

}