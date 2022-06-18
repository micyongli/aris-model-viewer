import React, {useContext} from "react";
export const StoreContext = React.createContext({});

export default function useStore() {
    return useContext(StoreContext);
}
