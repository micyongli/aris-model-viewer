import {isArray} from 'lodash';

function empty(arr) {
    return isArray(arr) && arr.length === 0;
}

export default function dispatcher(state, action) {
    const {type, value} = action;
    switch (type) {
        case 'SetHighDefines': {
            let {highDefines, ...other} = state;
            if (!isArray(value)) {
                return state;
            }
            if (empty(highDefines) && empty(value)) {
                return state;
            }
            if (highDefines.length === value.length &&
                highDefines.join('') === value.join('')) {
                return state;
            }
            return {...other, highDefines: value};
        }
        default: {
            return state;
        }
    }
}

export function initStore() {
    return {
        isAdmin: true,
        highDefines: []
    };
}