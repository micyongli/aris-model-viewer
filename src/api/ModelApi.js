import {get} from "./Fetch";
import {toMap} from "../utils/url";

const url = `/portal/process/occAndDef`;

export async function getModelById(modelId, before, after) {
    const params = toMap(window.location.search);
    const obj = ({guid: modelId});
    if (params['withRef']) {
        if (params['userId']) {
            obj['userId'] = params['userId'];
        }
        if (params['posts']) {
            obj['posts'] = params['posts'];
        }
    }
    if (params['revision']) {
        obj['revision'] = parseInt(params['revision']);
    }
    return await get({url, params: obj, before, after});
}