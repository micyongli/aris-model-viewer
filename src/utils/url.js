import {isArray} from "lodash/lang";

export function toMap(search) {
    const ret = {};
    search && search.replace(/\?/, '')
        .split('&')
        .map(x => x.split('='))
        .forEach(x => {
            let [k, v, ...other] = x;
            v = v + other.map(z => z === '' ? '=' : z).join('');
            if (typeof ret[k] !== 'undefined') {
                if (isArray(ret[k])) {
                    ret[k].push(v);
                } else {
                    ret[k] = [ret[k], v];
                }
            } else
                ret[k] = v;
        });
    return ret;
}


export function toUrlParams(mapObject) {
    const ret = [];
    for (let key in mapObject) {
        if (!mapObject.hasOwnProperty(key)) {
            continue;
        }
        const v = mapObject[key];
        if (isArray(v)) {
            v.forEach(x => {
                ret.push([key, x]);
            });
        } else {
            ret.push([key, (typeof v === 'undefined' || v === null) ? '' : v])
        }
    }
    return ret.map(x => x.join('=')).join('&');
}


export function isUrl(str_url) {
    return /^(https|http|ftp)?:\/\//.test(str_url);
}
