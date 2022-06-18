import {message} from 'antd';
import {toMap, toUrlParams} from "../utils/url";


let proxySuffix = '';

let env = process.env.NODE_ENV;

if (env === 'development') {
    proxySuffix = '/api'
} else {
    proxySuffix = '/prod-api'
}

export function getBaseUrl() {
    return proxySuffix;
}

async function _Fetch({suffix, url, method, params, data, onBefore, onAfter}) {
    _Fetch.on_before(onBefore);
    let realUrl = `${suffix ? suffix : ''}${url}`;
    if (typeof params === 'string') {
        realUrl = `${realUrl}?${params}`;
    } else if (typeof params === 'object') {
        realUrl = `${realUrl}?${toUrlParams(params)}`;
    }
    if (!method) {
        method = `GET`;
    }
    const isMultipart = data instanceof FormData;
    const header = {headers: _Fetch.with_token()};
    const body = typeof data === 'object' ? {body: isMultipart ? (data) : JSON.stringify(data)} : ({});
    if (!isMultipart) {
        header['headers']['Content-Type'] = 'application/json';
    }
    const r = await fetch(realUrl, {
        ...header,
        method,
        credentials: 'include', ...body
    });
    if (typeof r === 'string') {
        debugger
    }
    const no = _Fetch.validate(r.status, r.statusText);
    const json = await r.json();
    if (no) {
        _Fetch.validate_json(json);
    }
    _Fetch.on_after(onAfter, json);
    return json;

}

_Fetch.getTokenFromUrl = function () {
    const search = _Fetch.get_params_from_url();
    return search['token'];
}

_Fetch.with_token = function () {
    const header = _Fetch.get_header();
    const token = _Fetch.getTokenFromUrl();
    if (token) {
        header['Authorization'] = `Bearer ${token}`;
    }
    return header;
}

_Fetch.on_before = function (cb) {
    typeof cb === 'function' && cb();
}

_Fetch.on_after = function (cb, data) {
    typeof cb === 'function' && cb(data);
}

_Fetch.get_params_from_url = function () {
    return toMap(window.location.search);
}

_Fetch.get_header = function () {
    return {};
}

const error_map = {
    'Internal Server Error': '内部服务出错',
    'Gateway Timeout': '网络异常'
};

_Fetch.get_map = function (key) {
    return error_map[`${key}`] || '';
}

_Fetch.validate = function (status, err_msg) {
    if ([200].indexOf(status) < 0) {
        const er = _Fetch.get_map(err_msg) || err_msg;
        message.error(er);
        return false;
    }
    return true;
}

_Fetch.validate_json = function (json) {
    if (typeof json === 'object' && [200].indexOf(json['code']) < 0) {
        if ([401].indexOf(json['code']) >= 0) {
            message.error(`未授权的请求`);
            return false;
        }
        if ([500].indexOf(json['code']) >= 0) {
            message.error(`后端服务开小差了(code:500)`);
            return false;
        }
        const msg = json['error'] || json['msg'] || json['message'] || '未知的错误消息';
        const m_msg = _Fetch.get_map(msg) || msg;
        message.error(m_msg);
        return;
    }
    return true;
}

export const FetchUtil = _Fetch;

export async function get({url, params, data, before, after}) {
    return await _Fetch({suffix: proxySuffix, data, params, url, method: 'GET', onAfter: after, onBefore: before});
}

export async function post({url, params, data, before, after}) {
    return await _Fetch({suffix: proxySuffix, url, params, data, method: 'POST', onAfter: after, onBefore: before});
}

export async function del({url, params, data, before, after}) {
    return await _Fetch({suffix: proxySuffix, url, params, data, method: 'DELETE', onAfter: after, onBefore: before});
}

export async function put({url, params, data, before, after}) {
    return await _Fetch({suffix: proxySuffix, url, params, data, method: 'PUT', onAfter: after, onBefore: before});
}


