import {get,} from "./Fetch";

const attrUrlBase = `/portal/symbol`;

const attrUrl = `${attrUrlBase}/config/get_model_id`;

export async function getTopModel(paramObj, before, after) {
    return await get({url: attrUrl, params: paramObj, before, after});
}
