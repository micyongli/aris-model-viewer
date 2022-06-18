import {get} from "./Fetch";

const attrUrlBase = `/portal/symbol`;

const attrUrl = `${attrUrlBase}/attrs`;

export async function getAttrs(paramObj, before, after) {
    return await get({url: attrUrl, params: paramObj, before, after});
}

const attrLocaleUrl = `${attrUrlBase}/append_or_update_locale`;

export async function updateAttrLocale(param, before, after) {
    return await get({url: attrLocaleUrl, params: param, before, after});
}

const attrResetLocaleUrl = `${attrUrlBase}/reset_locale`;

export async function resetAttrLocale(param, before, after) {
    return await get({url: attrResetLocaleUrl, params: param, before, after});
}


const attrSolution = `${attrUrlBase}/solution_name`;


export async function querySolutionName(before, after) {
    return await get({url:`${attrSolution}`, before, after});
}

