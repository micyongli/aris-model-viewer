import React, {useEffect, useState} from 'react';
import {alpha, makeStyles, withStyles} from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {AccordionDetails, AccordionSummary, Button, Chip, Link, Popover, Typography} from "@material-ui/core";
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import LinkRoundedIcon from '@material-ui/icons/LinkRounded';
import MissedVideoCallRoundedIcon from '@material-ui/icons/MissedVideoCallRounded';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import VisibilityIcon from '@material-ui/icons/Visibility';
import DescriptionIcon from '@material-ui/icons/Description';
import Tooltip from '@material-ui/core/Tooltip';
import {isArray} from 'lodash';
import {isUrl} from "../../utils/url";
import {FetchUtil, getBaseUrl} from "../../api/Fetch";
import {AllInclusive, ArrowDropDown, ArrowRight, Backspace, Delete} from "@material-ui/icons";
import {isMobile} from "../../utils/mobile";
import CloseIcon from "@material-ui/icons/Close";


const AccordionSummaryRewrite = withStyles({
    root: {
        backgroundColor: 'rgba(0, 0, 0, .03)',
        minHeight: 16,
        '&$expanded': {
            minHeight: 16,
        },
    },
    content: {
        '&$expanded': {
            margin: '6px 0',
        },
    },
    expanded: {},
})(AccordionSummary);

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        backgroundColor: '#f0f0f0',
        padding: theme.spacing(0.5),
        overflowX: 'hidden',
        overflowY: 'auto',
    },
    panelHead: {
        marginRight: theme.spacing(1),
        display: 'flex',
        color: alpha(theme.palette.common.black, 0.5),
    },
    relationCell: {
        fontsize: 0.5,
        color: alpha(theme.palette.common.black, 0.5),
    },
    leftCell: {
        minWidth: 160,
        fontWeight: 600,
    },
    disabledCell: {
        minWidth: 160,
        color: theme.palette.grey["500"],
    },
    empty: {},
    subGroup: {
        flexDirection: 'row',
        width: '100%',
    },
    subAcc: {
        margin: 0,
    },
    subAccHead: {
        boxShadow: 'none',
        border: '1px solid rgba(0, 0, 0, .125)',
    },
    heading: {
        fontSize: 14,
        fontWeight: theme.typography.fontWeightRegular,
    },
    versionStyle: {
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    popover: {
        padding: theme.spacing(1),
    },
    popoverItem: {
        display: 'flex',
        flexDirection: 'row',
        margin: theme.spacing(1),
    },
    hackBorder: {
        '& tr:last-child>td': {
            border: 'none',
        },
        '& tr:nth-of-type(odd)': {
            backgroundColor: '#f6f6f6',
        }
    },
    itemDoc: {
        display: 'flex',
        justifyItems: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        margin: 16,
    },
    itemDocChild: {
        display: 'flex',
        alignItems: 'center',
        paddingRight: 8,
    }
}));

export default function ArisAttrTab({
                                    onBack,
                                    isAdmin,
                                    onDocCommand,
                                    data,
                                    onJump,
                                    currentModel,
                                    onDoubleClick,
                                    isClickModel,
                                    onCloseClick,
                                }) {
    const {type, attrs, guid, relations, docs, relObjects, interfaceList} = data || {};
    const styles = useStyles();

    const doJump = (e, {modelId, occId}) => {
        e.preventDefault();
        typeof onJump === 'function' && onJump({modelId, occId});
    }

    function renderRelations() {
        if (!isArray(relations) || relations.length === 0) {
            return <TableRow><TableCell>无</TableCell></TableRow>;
        }
        return relations.map((model, inx) => {
            let isSelf = currentModel['modelId'] === model['modelId'];
            return (
                <TableRow key={`relation${inx}`}>
                    <TableCell className={styles.leftCell}>
                        {
                            isSelf ?
                                <span
                                    title={`类型：${model['typeName']}\n模型：${model['modelLocaleName']}`}>{model['modelName']}</span> :
                                <Link
                                    title={`类型：${model['typeName']}\n模型：${model['modelLocaleName']}`}
                                    href={'#'}
                                    onClick={e => doJump(e, model)}>
                                    {model['modelName']}
                                </Link>
                        }
                    </TableCell>
                    <TableCell className={styles.relationCell}>
                        {model['modelLocaleName']}
                    </TableCell>
                </TableRow>
            );
        })
    }

    const [menuEl, setMenuEl] = useState(null);
    const [currentDoc, setCurrentDoc] = useState(null);

    function menuCommand(cmd) {
        if (currentDoc) {
            onDocCommand && onDocCommand(currentDoc, cmd);
            setCurrentDoc(null);

            setMenuEl(null);
        }
    }

    function renderInterface(rx) {
        const upList = rx.filter(x => x['ioFlag'] === 'up');
        const downList = rx.filter(x => x['ioFlag'] === 'down');
        const groups = [];
        if (upList.length > 0) {
            groups.push({groupName: '上级', children: upList});
        }
        if (downList.length > 0) {
            groups.push({groupName: '下级', children: downList});
        }
        return groups.map((x, inx) => <Accordion className={styles.subAccHead}
                                                 square
                                                 key={inx}
                                                 expanded={subProcessExpanded === `PI_${inx}`}
                                                 onChange={handleSubProcessChange(`PI_${inx}`)}>
            <AccordionSummaryRewrite>
                <Typography className={styles.heading}>{x['groupName']}</Typography>
            </AccordionSummaryRewrite>
            <AccordionDetails>
                <List style={{padding: 0}}>
                    {
                        x['children'].map((attr, inx) => <ListItem key={inx} style={{paddingLeft: 0}}>
                            <Link href={'#'}
                                  onClick={e => doJump(e, {modelId: attr['guid']})}>
                                {attr['name']}</Link>
                            <Chip color={'primary'} label={attr['typeName']} size={'small'}/>
                        </ListItem>)
                    }
                </List>
            </AccordionDetails>
        </Accordion>);

    }

    function getTokenFromUrl() {
        const s = FetchUtil.getTokenFromUrl();
        return s ? `&token=${s}` : '';
    }

    function renderDocs() {
        if (!isArray(docs) || docs.length === 0) {
            return <TableRow><TableCell>无</TableCell></TableRow>;
        }
        return docs.map((doc, inx) => {
            return (
                <TableRow key={`doc_${inx}`}>
                    <TableCell className={styles.leftCell}>
                        <Link target="_blank"
                              href={`${getBaseUrl()}${doc['previewUrl']}?obj_doc=1${getTokenFromUrl()}`}>
                            {doc['uri']}
                        </Link>
                    </TableCell>
                    <TableCell className={styles.relationCell}>
                        <Link target="_blank"
                              href={`${getBaseUrl()}${doc['previewUrl']}?obj_doc=1&download=1${getTokenFromUrl()}`}>下载</Link>
                    </TableCell>
                    <TableCell className={styles.relationCell}>
                        <div className={styles.versionStyle} onClick={(e) => {
                            if (isAdmin) {
                                setCurrentDoc(doc);
                                setMenuEl(e.target);
                            }
                        }}>版本 {doc['version']}
                        </div>
                    </TableCell>
                </TableRow>
            );
        })
    }


    function onDblAttr(attr, index, isKey) {
        if (!isKey) {
            if (!allowRewriteValue(attr['typeName'])) {
                return;
            }
        }
        typeof onDoubleClick === 'function' && onDoubleClick(type, guid, attr, index, isKey);
    }


    function renderAttrs() {
        const inlineTextStyle = {margin: 2, padding: 0};
        if (!isArray(attrs) || attrs.length === 0) {
            return <TableRow><TableCell>无</TableCell></TableRow>;
        }
        const tail = specifies2Tail();
        const head = specifies2Head();
        const newAttrs = attrs.filter(x => tail.indexOf(x['typeName']) < 0 && head.indexOf(x['typeName']) < 0);
        tail.forEach(x => {
            attrs.filter(y => y['typeName'] === x)
                .forEach(y => newAttrs.push(y));
        });
        head.forEach(x => {
            attrs.filter(y => y['typeName'] === x)
                .forEach(y => newAttrs.unshift(y));
        });
        return newAttrs.map(
            (attr, inx) => {
                const currentTypeName = attr['typeName'];
                let disabled = false;
                if (tail.indexOf(currentTypeName) >= 0) {
                    disabled = true;
                }
                let attrValue = attr['attrValue'];
                let render = attrValue;
                if (render && render.indexOf('\n') >= 0) {
                    render = render.split('\n').map((txt, inx) => <p style={inlineTextStyle}
                                                                     key={inx}>{txt}</p>);
                }
                return <TableRow key={`attr_${inx}`}>
                    <TableCell
                        className={disabled ? styles.disabledCell : styles.leftCell}
                        onDoubleClick={e => !disabled && onDblAttr(attr, inx, true)}
                        title={`类型号：${attr['typeName']}\n区域语言：${attr['locale']}`}
                    >
                        {attr['localeValue']}
                    </TableCell>
                    <TableCell className={disabled ? styles.disabledCell : styles.empty}
                               onDoubleClick={e => onDblAttr(attr, inx, false)}
                               title={`类型号：${attr['typeName']}\n区域语言：${attr['locale']}`}
                    >
                        {attr['typeName'] === 'AT_DOCUMENTATION' ?
                            <Link target="_blank" title={`${attr['attrValue']}`}
                                  href={`${getBaseUrl()}${attr['previewUrl']}${getTokenFromUrl()}`}
                            ><VisibilityIcon/>
                            </Link> : (
                                isUrl(attrValue) ?
                                    <Link target={'_blank'}
                                          href={`${attrValue}`}>链接</Link> : render
                            )}
                    </TableCell>
                </TableRow>;
            }
        );
    }


    function allowRewriteValue(typeName) {
        return ['AT_TYPE_6'].indexOf(typeName) >= 0;
    }

    function specifies2Tail() {
        return ['AT_CREAT_TIME_STMP', 'AT_CREATOR', 'AT_LAST_CHNG_2', 'AT_LUSER'];
    }

    function specifies2Head() {
        return ['AT_TYPE_6', 'AT_NAME',];
    }

    const [expanded, setExpanded] = useState('p1');

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const [subExpanded, setSubExpanded] = useState(false);
    const handleSubChange = (panel) => (event, isExpanded) => {
        setSubExpanded(isExpanded ? panel : false);
    };

    const [subProcessExpanded, setSubProcessExpanded] = useState(false);
    const handleSubProcessChange = (panel) => (event, isExpanded) => {
        setSubProcessExpanded(isExpanded ? panel : false);
    };

    useEffect(() => {
        if (isClickModel) {
            setExpanded('p1');
            return;
        }
        if (isArray(relObjects) && relObjects.length === 0 && expanded === 'p2') {
            setExpanded('p1');
            return;
        }
        if (isArray(relations) && relations.length === 0 && expanded === 'p3') {
            setExpanded('p1');
        }

    }, [isClickModel, data]);

    const mapTo = {
    };

    const [currentDocs, setCurrentDocs] = useState([]);
    const [docEl, setDocEl] = useState(null);

    function renderItemDocs(docs) {
        if (!isArray(docs) || docs.length === 0) {
            return null;
        }

        return <ArrowDropDown cursor={'pointer'} onClick={(e) => {
            if (docs.length > 0) {
                setCurrentDocs(docs);
                setDocEl(e.target);
            }
        }}/>
    }

    const renderSubGroup = rx => {
        if (!isArray(rx)) {
            return null;
        }
        const groups = [];
        rx.forEach(x => {
            let {localeTypeName} = x;
            if (mapTo[localeTypeName]) {
                localeTypeName = mapTo[localeTypeName];
            }
            let pushed = false;
            groups.forEach(y => {
                if (y['g'] === localeTypeName) {
                    y.children.push(x);
                    pushed = true;
                }
            });
            if (!pushed) {
                groups.push({g: localeTypeName, children: [x]});
            }
        });
        return groups.map((x, inx) => <Accordion className={styles.subAccHead} square key={inx}
                                                 expanded={subExpanded === `P${inx}`}
                                                 onChange={handleSubChange(`P${inx}`)}>
            <AccordionSummaryRewrite>
                <Typography className={styles.heading}>{x['g']}</Typography>
            </AccordionSummaryRewrite>
            <AccordionDetails>
                <List style={{padding: 0}}>
                    {
                        x['children'].map((attr, inx) => <ListItem key={inx} style={{paddingLeft: 0}}>
                            <Link href={'#'}
                                  onClick={e => doJump(e, attr)}>
                                {attr['name']}</Link>
                            {renderItemDocs(attr['mixtureDocs'])}
                        </ListItem>)
                    }
                </List>
            </AccordionDetails>
        </Accordion>);
    };

    function back() {
        onBack && onBack();
    }

    return (
        <div className={styles.root}>
            {!isMobile() ? <AccordionSummary
                expandIcon={<CloseIcon onClick={e => onCloseClick && onCloseClick()}/>}>
            </AccordionSummary> : null
            }
            {isMobile() ? <div><Button onClick={back} startIcon={<Backspace/>}>返回</Button></div> : null}
            <Accordion expanded={expanded === 'p1'} onChange={handleChange('p1')}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon/>}>
                    <div className={styles.panelHead}>
                        <InfoOutlinedIcon/>
                    </div>
                    <Tooltip title={'点击收缩/展开'} placement='top-start'>
                        <Typography>基本信息</Typography>
                    </Tooltip>
                </AccordionSummary>
                <AccordionDetails>
                    <TableContainer>
                        <Table size={'small'}>
                            <TableBody className={styles.hackBorder}>
                                {renderAttrs()}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </AccordionDetails>
            </Accordion>
            {isArray(relObjects) && relObjects.length > 0 ?
                <Accordion expanded={expanded === 'p2'} onChange={handleChange('p2')}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon/>}
                    >
                        <div className={styles.panelHead}>
                            <LinkRoundedIcon/>
                        </div>
                        <Tooltip title={'点击展开/收起'} placement='top-start'>
                            <Typography>关联元素</Typography>

                        </Tooltip>
                    </AccordionSummary>
                    <AccordionDetails>
                        <div className={styles.subGroup}>
                            {renderSubGroup(relObjects)}
                        </div>
                    </AccordionDetails>
                </Accordion> : null
            }

            {(isArray(relations) && relations.length > 0) ?
                <Accordion expanded={expanded === 'p3'} onChange={handleChange('p3')}>

                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                        <div className={styles.panelHead}>
                            <MissedVideoCallRoundedIcon/>
                        </div>
                        <Tooltip title={'点击展开/收起'}>
                            <Typography>出现</Typography>
                        </Tooltip>
                    </AccordionSummary>

                    <AccordionDetails>
                        <TableContainer>
                            <Table size={'small'}>
                                <TableBody className={styles.hackBorder}>
                                    {renderRelations()}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </AccordionDetails>
                </Accordion> : null}
            {(isArray(docs) && docs.length > 0) ?
                <Accordion expanded={expanded === 'p4'} onChange={handleChange('p4')}>
                    <AccordionDetails>
                        <TableContainer>
                            <Table size={'small'}>
                                <TableBody className={styles.hackBorder}>
                                    {renderDocs()}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </AccordionDetails>
                </Accordion> : null}

            {(isArray(interfaceList) && interfaceList.length > 0) ?
                <Accordion expanded={expanded === 'p5'} onChange={handleChange('p5')}>

                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                        <div className={styles.panelHead}>
                            <AllInclusive/>
                        </div>
                        <Tooltip title={'点击展开/收起'}>
                            <Typography>流程接口</Typography>
                        </Tooltip>
                    </AccordionSummary>

                    <AccordionDetails>
                        <TableContainer>
                            <Table size={'small'}>
                                <TableBody className={styles.hackBorder}>
                                    {renderInterface(interfaceList)}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </AccordionDetails>
                </Accordion> : null}
            {
                isAdmin ? <Popover anchorEl={menuEl} open={Boolean(menuEl)} onClose={() => setMenuEl(null)}>
                    <div className={styles.popover}>
                        <Chip className={styles.popoverItem} size={'small'} color={'secondary'} icon={<Delete/>}
                              onClick={() => menuCommand('del')} clickable
                              label="删除"/>
                    </div>
                </Popover> : null
            }

            <Popover anchorEl={docEl}
                     anchorOrigin={{
                         vertical: 'top',
                         horizontal: 'left',
                     }}
                     open={Boolean(docEl)}
                     onClose={() => setDocEl(null)}>
                <div className={styles.popover}>
                    {
                        currentDocs.map((d, inx) => {
                            return <div className={styles.itemDoc} key={`${inx}`}>
                                <div className={styles.itemDocChild}>
                                    <ArrowRight color={'inherit'}/>
                                </div>
                                <div className={styles.itemDocChild}>
                                    <Link target="_blank"
                                          color={'inherit'}
                                          underline={'none'}
                                          href={`${getBaseUrl()}${d['previewUrl']}`}>
                                        {d['fileName']}
                                    </Link>
                                </div>
                                <div className={styles.itemDocChild}>
                                    <Link target="_blank"
                                          color={'primary'}
                                          underline={'none'}
                                          href={`${getBaseUrl()}${d['downloadUrl']}`}>
                                        下载
                                    </Link>

                                </div>

                            </div>;
                        })
                    }
                </div>
            </Popover>
        </div>
    );
}
