import React,{useState} from 'react';
import PrimaryIcon from "./PrimaryIcon";

export default function IconGroup({children}) {
    function click(e) {
        console.log('ok')
    }

    const x=children.map(x=>(x.props.active))

    const newChildren = children.map(x => {
        console.log('runn')
        const old = x.props.onClick;
        const oldActive=x.props.active;

        return {
            ...x,
            props: {
                ...x.props,
                onClick: e => {
                    console.log('before', e)
                    old && old(e);
                    console.log('after', e)
                },
            }
        };
    });
    console.log(children, children[0].type === PrimaryIcon)
    return newChildren;
}