import './App.css';
import ArisSymbolSvg from "./components/symbol/ArisSymbolSvg";
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useHistory, useLocation,} from "react-router-dom";
import {message} from 'antd';
import {makeStyles, withStyles} from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import SplitPane from "react-split-pane";
import ArisAttrTab from "./components/symbol/ArisAttrTab";
import {getModelById} from "./api/ModelApi";
import {getAttrs, querySolutionName, resetAttrLocale, updateAttrLocale} from "./api/AttrApi";
import {cleanKey, getLocalValue, setLocalValue} from "./api/LocalStorage";
import ArisAttrChangeDialog from "./components/symbol/ArisAttrChangeDialog";
import {ArisSearch} from "./components/symbol/ArisSearch";
import {toMap, toUrlParams,} from "./utils/url";
import {getTopModel} from "./api/TopModelApi";
import {isArray} from "lodash/lang";
import {VIEWER_URL} from "./route/router";
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import VisibilityIcon from '@material-ui/icons/Visibility';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import DesktopWindowsIcon from '@material-ui/icons/OpenInBrowser';
import LaunchIcon from '@material-ui/icons/Launch';
import Backdrop from '@material-ui/core/Backdrop';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import {
    BottomNavigation,
    BottomNavigationAction,
    ButtonBase,
    CircularProgress,
    Divider,
    InputBase,
    InputLabel,
    List,
    ListItem,
    MenuItem,
    MenuList,
    Paper,
    SwipeableDrawer,
    Switch,
    Tooltip,
    Typography,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import {isMobile} from "./utils/mobile";
import {DropzoneDialog} from "material-ui-dropzone";
import {del, post,} from "./api/Fetch";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Draggable from "react-draggable";
import ReportProblemIcon from '@material-ui/icons/Comment';

import CommentDialog from './components/comment/CommentDialog';
import {
    ArrowDownward,
    ArrowUpward,
    ArtTrackTwoTone,
    AspectRatioOutlined,
    AspectRatioSharp,
    ChangeHistoryTwoTone,
    ScreenShareTwoTone
} from "@material-ui/icons";
import ResponsiveDialog from "./components/commons/ResponsiveDialog";
import useStore from "./store/useStore";
import {IEVersion} from "./utils/ie";


const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        pointerEvents: 'none',
    },
    toolbar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        display: 'flex',
        right: 0,
        alignItems: 'center',
        userSelect: 'none',
        borderRadius: 8,
        marginBottom: 8,
        marginLeft: 4,
        marginRight: 4,
        backgroundColor: 'rgb(255,251,240,0.6)',
        border: '1px solid #e2e2e2'
    },
    toolBarBottom: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        padding: '2px',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'flex-start',
        width: '95%',
    },
    wrapTextBox: {
        width: '95%',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        color: '#9e9e93'
    },
    navButton: {
        borderRadius: 32,
        display: 'flex',
        '&:after': {
            fontSize: 0,
            content: '',
            minHeight: 'inherited',
            color: 'white',
        },
        cursor: 'pointer',
        marginLeft: 8,
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        justifyItems: 'center',
    },
    hiddenChip: {
        display: 'none',
    },
    chip: {
        pointerEvents: 'auto',
        marginRight: theme.spacing(0.5),
    },
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        padding: theme.spacing(2, 4, 3),
    },
    sw: {
        margin: theme.spacing(1),
    },
    listItemText: {
        margin: 4,
    },
    searchIcon: {
        padding: theme.spacing(0, 2),
        height: '100%',
        display: "flex",
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E8EBED',
        color: 'black'
    },
    searchInput: {
        color: 'black'
    },
    searchInputEmpty: {
        backgroundColor: 'red',
        animation: 'switch-color 0.2s infinite',
        color: '#E8EBED',
        height: 24,
        borderBottomRightRadius: 4,
        borderTopRightRadius: 4,
    },
    search: {
        borderRadius: theme.shape.borderRadius,
        paddingLeft: 16,
        width: 'auto',
        display: 'flex',
        alignItems: 'center',
        color: theme.palette.common.white,
        pointerEvents: 'auto',
        height: 24,
        border: '1px solid #e8ebed',
        borderRightWidth: 0,
    },

    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
    highLight: {
        display: "flex",
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dlgIcon: {
        display: "flex",
        justifyItems: 'center',
    }
}));
const styles = (theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(2),
        flexDirection: 'row',
        display: 'flex',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
    textLabel: {
        marginTop: theme.spacing(5),
    }
});

const DialogTitle = withStyles(styles)((props) => {
    const {children, classes, onClose, ...other} = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root} {...other}>
            <Typography variant={'h6'} style={{marginLeft: 8,}}>{children}</Typography>
            {onClose ? (
                <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
                    <CloseIcon/>
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
});

const DialogContent = withStyles((theme) => ({
    root: {
        minWidth: 400,
    },
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(1),
    },
}))(MuiDialogActions);

function PaperComponent(props) {
    return (
        isMobile() ? <Paper {...props} /> :
            <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
                <Paper {...props} />
            </Draggable>
    );
}

function App() {
    const [, dispatch] = useStore();
    const styles = useStyles();
    const toolEl = useRef();
    const [loadingState, setLoadingState] = useState(false);
    const [modelData, setModelData] = useState(null);
    const [modelId, setModelId] = useState(null);
    const [modelList, setModelList] = useState([]);
    const location = useLocation();
    const history = useHistory();
    //符号选择
    const [selectedSymbolId, setSelectedSymbolId] = useState(null);

    async function requestTopModel(modelCat) {
        const ret = await getTopModel({modelCat});
        return ret && ret['data'] ? ret['data']['modelValue'] : null;
    }


    /**
     * 查询参数
     * @returns {*}
     */
    function queryParams() {
        const {search} = location;
        return toMap(search);
    }

    const [usingLocalStore, setUsingLocalStore] = useState(false);

    /**
     * 路径中的路由发生变化
     */
    useEffect(() => {
        setUsingLocalStore(!!getLocalValue('__remind__'));
        const params = queryParams();
        const {occId, id, top, highLight} = params;

        if (highLight) {
            const highLightDefines = highLight.split('|').filter(x => x !== '');
            dispatch({type: 'SetHighDefines', value: highLightDefines});
        } else {
            dispatch({type: 'SetHighDefines', value: []});
        }
        if (top && !id) {
            requestTopModel(top)
                .then(r => {
                    setModelId(r);
                    setSelectedSymbolId({type: 'model', id: r});
                });
            return;
        }
        if (!id) {
            toSearchPage();
            return;
        }
        setModelId(id);
        if (occId) {
            setSelectedSymbolId({type: 'symbol', id: occId});
            return;
        }
        setSelectedSymbolId({type: 'model', id});
    }, [location]);

    function toSearchPage() {
        const p = queryParams();
        if (p['page'] !== 'search' || history.location.pathname !== `${VIEWER_URL}`) {
            history.push(`${VIEWER_URL}?page=search`);
        }
    }

    const [obj, setObj] = useState(null);

    const jumpModel = (item) => {
        setRemind(false);
        const data = item;
        if (isArray(data) && data.length > 1) {
            const local = getLocalValue('__remind__');
            if (local) {
                const {symbolName} = item;
                const found = local[symbolName];
                const results = data.filter(x => x['modelType'] === found);
                if (results.length > 0) {
                    toModel({modelId: results[0]['modelGuid']});
                    setModelList([]);
                    setShow(false);
                    return;
                }
            }
            setObj(item);
            setModelList(data);
            setShow(true);
            return;
        }
        toModel({modelId: data[0]['modelGuid']});
        setModelList([]);
        setShow(false);
    };

    function isOk(res) {
        return typeof res['code'] !== 'undefined' && [0, 200].indexOf(res['code']) >= 0;
    }

    /**
     * 获取模型数据
     * @param modelId
     * @returns {Promise<any>}
     */
    async function getModel(modelId) {
        const ret = await getModelById(
            modelId,
            async () => setLoadingState(true),
            async () => setLoadingState(false)
        );

        if (!isOk(ret)) {
            message.error(ret.message);
        }
        return ret;
    }

    async function fetchModel(id) {
        const r = await getModel(id);
        setModelData(r);
    }


    useEffect(() => {

        if (!modelId) {
            return;
        }
        setActive(false);
        fetchModel(modelId).catch(e => {
            if (!params || !params['symbol']) {
                onSelectedModel({}, modelId);
            }
        });
    }, [modelId]);

    const [show, setShow] = useState(false);


    const [attrs, setAttrs] = useState(null);

    async function onClickShape({occId}) {
        setSelectedSymbolId({type: 'symbol', id: occId});
    }

    async function getSymbolAttrs(type, guid, mid) {

        if (type === 'symbol') {
            const x = (modelData && modelData['data'] && modelData['data']['obj'].filter(x => x['occId'] === guid)) || [];
            if (x.length > 0) {
                guid = x[0]['defineGuid'];
            }
        }
        const res = await getAttrs({type, guid, modelId: mid});
        setAttrs({type, guid, ...res.data});
    }

    useEffect(() => {
        if (modelId && selectedSymbolId) {
            const {type, id} = selectedSymbolId;
            getSymbolAttrs(type, id, modelId).then(x => {
            });
        }
    }, [selectedSymbolId])


    const [active, setActive] = useState(false);

    function clickSwitch() {
        setActive(!active);
    }

    function splitter() {
        let wid = '450px';
        return (!active || isMobile()) ? '0' : wid;
    }

    const clickModel = x => {
        if (remind) {
            const {symbolName} = obj;
            const {modelType} = x;
            let store = getLocalValue('__remind__');
            if (!store) {
                store = {};
            }
            store[symbolName] = modelType;
            setLocalValue('__remind__', store, 365 * 24 * 3600);
        }
        setShow(false);
        const id = x['modelGuid'];
        toModel({modelId: id});
    }

    const [remind, setRemind] = useState(false);

    function renderJumpDlg() {
        return <Dialog
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={styles.modal}
            open={show}
            onClose={e => setShow(false)}
            closeAfterTransition
            PaperComponent={PaperComponent}
            fullWidth={true}
            maxWidth={'lg'}
        >
            <DialogTitle style={{cursor: 'move'}} id="draggable-dialog-title" onClose={e => {
                setShow(false)
            }}>
                下层模型列表
            </DialogTitle>
            <DialogContent dividers>
                <List component={'nav'}>
                    {
                        modelList.map((x, inx) => {
                            return [
                                <ListItem button onClick={() => clickModel(x)} key={`${inx}_p`}>
                                    {x['modelName']}
                                </ListItem>,
                                (inx !== modelList.length - 1 ? <Divider key={`${inx}_k`}/> : null)
                            ];
                        })
                    }
                </List>

            </DialogContent>
            <DialogActions>
            </DialogActions>
        </Dialog>
    }

    const [showAttrDialog, setShowAttrDialog] = useState(false);
    const [params, setParams] = useState(null);

    const [solutionName, setSolutionName] = useState(null);
    const [editedKey, setEditedKey] = useState(true);
    const [status] = useStore();

    function canEdit() {
        return status && status['isAdmin'];
    }

    async function onDoubleClick(type, guid, attr, index, isKey) {

        if (!canEdit()) {
            return;
        }
        setEditedKey(isKey);
        const ret = await querySolutionName();
        if (!isOk(ret)) {
            message.error("数据请求失败");
            return;
        }
        setSolutionName(ret['msg']);

        setShowAttrDialog(true);
        setParams({type, guid, attr});

    }

    function onAttrDialogClose() {
        setShowAttrDialog(false);
    }

    async function onAttrReset(params) {
        const reqParams = {...params, modelId};
        const ret = await resetAttrLocale(reqParams, void 0, x => {
            setSolutionName(null);
            reloadAttrs();
            setShowAttrDialog(false);
        });
        if (!isOk(ret)) {
            message.error("数据请求失败");
        }
    }


    async function onNewAttr(params) {
        const reqParams = {...params, modelId};
        const ret = await updateAttrLocale(reqParams, void 0, x => {
            setSolutionName(null);
            reloadAttrs();
            setShowAttrDialog(false);
        });
        if (!isOk(ret)) {
            message.error("数据请求失败");
        }
    }

    function toModel({modelId, occId}) {
        const x = occId ? `&occId=${occId || ''}` : ``;
        const t = `${VIEWER_URL}?id=${modelId}${x}`;
        history.push(t);
    }

    const containerRef = useRef(null);


    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.addEventListener('wheel', prevent, {passive: false});
        }
        return () => {
            if (containerRef.current) {
                containerRef.current.removeEventListener('wheel', prevent, {passive: false});
            }
        }
    }, [containerRef.current]);

    function prevent(e) {
        e.preventDefault();
    }


    function isSearchPage() {
        const p = queryParams();
        return p['page'] === 'search';
    }

    const [searchTxt, setSearchTxt] = useState(null);

    const [pressEnter, setPressEnter] = useState(Date.now());

    const searchTextBox = useRef(null);

    const onEnter = (e) => {
        if (e.charCode === 13) {
            onSearch();
        }
    }

    const onSearch = e => {
        const v = searchTextBox.current.value;
        setSearchTxt(v);
        setPressEnter(Date.now());

    }

    function reloadAttrs() {
        if (modelId) {
            if (selectedSymbolId) {
                const {type, id} = selectedSymbolId;
                getSymbolAttrs(type, id, modelId).then(x => {
                });
            }
        }

    }

    function searchTargetCallback(targetId) {
        setSelectedSymbolId({type: 'symbol', id: targetId});
    }


    const onSelectedModel = (e, mid) => {
        setSelectedSymbolId({type: 'model', id: mid});
    };

    const [searchNothing, setSearchNothing] = useState(false);

    const searchNothingCallback = () => {
        setSearchNothing(true);
        setTimeout(() => setSearchNothing(false), 500);
    };

    const [showCommentDialog, setShowCommentDialog] = useState(false);

    function onCloseCommentDialog(e) {
        setShowCommentDialog(false);
    }

    const [full, setFull] = useState(false);

    function noIFrame() {
        return window.parent.window === window
    }

    function canFullScreen() {
        return document.fullscreenEnabled ||
            document.mozFullScreenEnabled ||
            document.webkitFullscreenEnabled ||
            document.msFullscreenEnabled;
    }

    function exitFullscreen() {
        const doc = document;
        if (doc.exitFullscreen) {
            doc.exitFullscreen();
        } else if (doc.msExitFullscreen) {
            doc.msExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
            doc.mozCancelFullScreen();
        } else if (doc.webkitExitFullscreen) {
            doc.webkitExitFullscreen();
        }

    }

    function launchFullscreen(element) {
        if (!canFullScreen()) {
            return;
        }
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullScreen();
        }
    }

    function isFullScreen() {
        return document.fullscreenElement !== null;
    }

    function doFullScreen() {
        if (noIFrame()) {
            if (isFullScreen()) {
                setFull(false);
                exitFullscreen();
            } else {
                launchFullscreen(document.documentElement);
                setFull(true);
            }
            return;
        }
        try {
            setFull(!full);
            window.parent.postMessage(!full, '*');
        } catch (e) {
            console.log(e);
        }
    }

    const messageHandler = useCallback(x => {
        if (noIFrame()) {
            return;
        }
        setFull(x.data);
    }, []);

    useEffect(() => {
        if (!noIFrame()) {
            window.addEventListener('message', messageHandler);
            return () => window.removeEventListener('message', messageHandler);
        }
    }, []);

    function getEpcListByType(ioFlag) {
        if (modelData && modelData['data'] && modelData['data']['assignedModelList']) {
            return modelData['data']['assignedModelList'].filter(x => x['ioFlag'] === ioFlag);
        }
        return [];
    }

    function getProcessAdjustmentId() {
        return modelData && modelData.data && modelData.data.processChangeBpmId;
    }

    const [intDlg, setIntDlg] = useState(false);

    function onClickInterfaceNode(x) {
        setIntDlg(false);
        toModel({modelId: x['guid'], occId: x['occId']});
    }

    function renderSvg() {
        if (isSearchPage()) {
            return;
        }
        const upList = getEpcListByType('up');
        const downList = getEpcListByType('down');


        return <>
            <div className="svg-top-container" ref={toolEl}>
                <ResponsiveDialog open={intDlg} onCancel={() => setIntDlg(false)}
                                  title={'级别上移'}>
                    <MenuList>
                        {upList.map((x, i) => <MenuItem
                            onClick={() => onClickInterfaceNode(x)}
                            key={i + '_up'}>
                            <div className={styles.dlgIcon}>
                                <ArrowUpward/>
                                {x.name}
                                <Chip label={x.typeName} size={'small'} color={'primary'}/>
                            </div>
                        </MenuItem>)}
                        {downList.map((x, i) => <MenuItem
                            onClick={() => onClickInterfaceNode(x)}
                            key={i + '_down'}>
                            <div className={styles.dlgIcon}>
                                <ArrowDownward/>
                                {x.name}
                                <Chip label={x.typeName} size={'small'} color={'primary'}/>
                            </div>
                        </MenuItem>)}
                    </MenuList>
                </ResponsiveDialog>
                <CommentDialog onClose={onCloseCommentDialog} open={showCommentDialog} modelId={modelId}/>
                <Backdrop open={loadingState} className={styles.backdrop}>
                    <CircularProgress color="inherit"/>
                </Backdrop>

                <SplitPane split="vertical"
                           primary={'second'}
                           size={splitter()}
                           allowResize={!isMobile() && active}
                           resizerStyle={(isMobile() || !active) ? {display: 'none'} : {}}
                >
                    <div className={'layout-left'} ref={containerRef}>
                        {
                            !isMobile() ? (
                                <div className={styles.toolbar}>
                                    {IEVersion() === -1 ?
                                        <IconButton size={'medium'}
                                                    color={'primary'}
                                                    title={!full ? '进入全屏' : '退出全屏'}
                                                    onClick={doFullScreen}
                                                    className={styles.navButton}>
                                            {!full ? <FullscreenIcon size='large'/> : <AspectRatioSharp/>}
                                        </IconButton> : null}
                                    <IconButton size={'medium'}
                                                color={'primary'}
                                                title='特性列表'
                                                onClick={clickSwitch}
                                                className={styles.navButton}>
                                        <ArtTrackTwoTone/>
                                    </IconButton>


                                </div>) : <div className={styles.toolbar}>
                                <div className={styles.search}>
                                    <InputBase size={'small'}
                                               className={searchNothing ? styles.searchInputEmpty : styles.searchInput}
                                               onKeyPress={onEnter}
                                               inputRef={searchTextBox}
                                               placeholder="搜索"/>
                                    <ButtonBase className={styles.searchIcon} onClick={onSearch}>
                                        <SearchIcon fontSize={'small'}/>
                                    </ButtonBase>
                                </div>
                                <div style={{display: 'flex', marginLeft: 8, fontWeight: 600,}}>
                                    {modelData && modelData.data && modelData.data.modelAttribute && modelData.data.modelAttribute.name}
                                </div>
                                <div className={styles.root}/>
                            </div>
                        }
                        <ArisSymbolSvg
                            searchKey={searchTxt}
                            pressEnter={pressEnter}
                            searchTargetCallback={searchTargetCallback}
                            onClickShape={onClickShape}
                            onSelectedModel={onSelectedModel}
                            callback={jumpModel}
                            selectedSymbolId={selectedSymbolId}
                            searchNothingCallback={searchNothingCallback}
                            modelData={modelData}/>

                        {
                            isMobile() ?
                                <BottomNavigation onChange={(e, v) => {
                                    switch (v) {
                                        case 1: {
                                            setActive(true);
                                            break;
                                        }
                                        default: {

                                        }
                                    }
                                }
                                }>
                                    <BottomNavigationAction value={1} icon={<VisibilityIcon/>}/>
                                </BottomNavigation>
                                : <div className={styles.toolBarBottom}>
                                    {
                                        modelData && modelData.data && modelData.data.modelAttribute && modelData.data.modelAttribute.path ?
                                            <Tooltip
                                                title={modelData.data.modelAttribute.path}>
                                                <div
                                                    className={styles.wrapTextBox}>{modelData.data.modelAttribute.path}
                                                </div>
                                            </Tooltip> : null
                                    }
                                </div>
                        }

                    </div>
                    <div className={`attrs-pane`}>
                        {isMobile() ? <SwipeableDrawer anchor={'left'}
                                                       open={active}
                                                       onClose={e => setActive(false)}
                                                       onOpen={e => setActive(true)}>
                            <ArisAttrTab onDoubleClick={onDoubleClick}
                                         data={attrs}
                                         isAdmin={canEdit()}
                                         currentModel={{modelId}}
                                         onBack={e => setActive(false)}
                                         onJump={toModel}/>
                        </SwipeableDrawer> : <ArisAttrTab onDoubleClick={onDoubleClick}
                                                          onCloseClick={e => setActive(false)}
                                                          data={attrs}
                                                          isAdmin={canEdit()}
                                                          currentModel={{modelId}}
                                                          onJump={toModel}/>
                        }
                    </div>

                </SplitPane>

                <ArisAttrChangeDialog attrSolutionName={solutionName}
                                      show={showAttrDialog}
                                      onOk={onNewAttr}
                                      params={params}
                                      onReset={onAttrReset}
                                      onClose={onAttrDialogClose}
                                      isKey={editedKey}/>
                {renderJumpDlg()}
            </div>
        </>;
    }

    function renderSearch() {
        if (!isSearchPage()) {
            return;
        }
        return <ArisSearch/>;
    }

    return (
        <div className="App">
            {renderSvg()}
            {renderSearch()}
        </div>
    );
}

export default App;
