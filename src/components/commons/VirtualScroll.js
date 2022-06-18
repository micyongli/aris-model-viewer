import React, {} from "react";
import './VirtualScroll.css';


export default function VirtualScroll({children}) {
    return (
        <div className={`vir-container`}>
            <div className={`inner-container`}>
                {children}
            </div>
        </div>
    );
}