import {get} from "./Fetch";

export async function get_epc_list(){
    return await get({url:'/portal/symbol/config/get_epc_list'});
}

export async function get_overview({params,before,after}){
    return await get({url:'/portal/process/overview',params});
}