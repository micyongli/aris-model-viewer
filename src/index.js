import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";
import "regenerator-runtime/runtime.js";
import React, {useReducer} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {BrowserRouter, Route} from 'react-router-dom';
import {VIEWER_URL,} from "./route/router";
import {createTheme} from '@material-ui/core/styles'
import {primaryThemeOptions} from "./theme/PrimaryTheme";
import {ThemeProvider,} from "@material-ui/styles";
import {StoreContext} from "./store/useStore";
import dispatcher, {initStore} from "./store/dispatcher";
import {IEVersion} from "./utils/ie";

const defaultTheme = createTheme(primaryThemeOptions);
function AppRoot() {
    const r = useReducer(dispatcher, null, initStore);
    if ([11, -1].indexOf(IEVersion()) < 0) {
        return 'No support';
    }
    return (
        <ThemeProvider theme={defaultTheme}>
            <StoreContext.Provider value={r}>
                <BrowserRouter>
                    <Route exact path={VIEWER_URL} component={App}/>
                </BrowserRouter>
            </StoreContext.Provider>
        </ThemeProvider>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AppRoot/>);

