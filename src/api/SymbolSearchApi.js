import {get,} from "./Fetch";
import {toUrlParams} from "../utils/url";

const attrUrlBase = `/portal/symbol`;

const searchUrl = `${attrUrlBase}/symbol_search`;

export async function searchSymbol(obj, before, after) {
    return await get({url: searchUrl, params: obj, before, after});
}

export async function relationOfModel(modelId, posts, userId) {
    const r = toUrlParams({modelId, posts, userId});
    return await fetch(`${attrUrlBase}/symbol_relation?${r}`);
}