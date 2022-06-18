import React, {useState} from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import {Avatar, FormControlLabel, Link, Paper, Radio, RadioGroup, TextField, Typography} from "@material-ui/core";

import {makeStyles, withStyles} from '@material-ui/core/styles';
import {DropzoneArea} from 'material-ui-dropzone'
import AddAlertIcon from '@material-ui/icons/AddAlert';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import {get, getBaseUrl, post} from "../../api/Fetch";
import {isArray} from 'lodash'
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Draggable from "react-draggable";
import {isMobile} from "../../utils/mobile";

const useStyles = makeStyles((theme) => ({
    form: {
        '& .MuiTextField-root': {
            margin: theme.spacing(1),
        },
        display: 'flex',
        flexDirection: 'column',
    },
    buttonArea: {
        marginTop: theme.spacing(1),
        display: "flex",
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
    },
    content: {
        margin: theme.spacing(2),
        display: "flex",
        width: '100%',
        flexDirection: 'column',
    },
    message: {
        marginBottom: 8,
    },
    messageRow: {
        display: "flex",
        flexDirection: 'row',
        border: '1px solid #efefef',
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        padding: theme.spacing(2),
        borderRadius: 8,
    },
    dialogContent: {
        display: 'flex',
    },
    messageBox: {
        paddingLeft: theme.spacing(1),
        width: '100%',
        marginTop: theme.spacing(1),
    },
    messageHeader: {
        flexDirection: 'row',
        paddingLeft: theme.spacing(1),
        display: "flex",
        marginBottom: theme.spacing(2),
    },
    messageHeaderRight: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: theme.spacing(4),
    },
    messagePosting: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: theme.spacing(5),
    },
    dropzone: {
        minHeight: 120,
        padding: theme.spacing(1),
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

function PaperComponent(props) {
    const {id} = props;
    if (isMobile()) {
        return <Paper {...props}/>;
    }
    return (
        <Draggable handle={id} cancel={'[class*="MuiDialogContent-root"]'}>
            <Paper {...props} />
        </Draggable>
    );
}

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


export default function CommentDialog({open, onClose, modelId, ModelName}) {
    const [fbState, setFbState] = useState(1);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const styles = useStyles();
    const descriptionElementRef = React.useRef(null);
    React.useEffect(() => {
        if (open) {
            const {current: descriptionElement} = descriptionElementRef;
            if (descriptionElement !== null) {
                descriptionElement.focus();
            }
            return;
        }
        setComments([]);
    }, [open]);

    const [files, setFiles] = useState([]);
    const [comments, setComments] = useState([]);


    function onUploaderChange(f) {
        setFiles(f);
    }


    async function onClickSendButton() {

        if (!title) {
            alert("请录入'标题'内容");
            return;
        }
        if (!content) {
            alert("请录入'建议'内容");
            return;
        }
        const uploadFileIds = [];
        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const form = new FormData();
                form.append('file', files[i], files[i].name);
                try {
                    const r = await post({url: '/emplog/attachment/upload', data: form});
                    debugger
                    if (r.code !== 200) {
                        return;
                    }
                    if (r.data && r.data['fileGuid']) {
                        uploadFileIds.push(r.data['fileGuid']);
                    }
                } catch (e) {
                    alert("上传文件失败");
                    return;
                }
            }
        }
        const postForm = {
            feedTitle: title.trim(),
            imgs: uploadFileIds,
            msg: content.trim(),
            procId: modelId,
            urgent: fbState
        }
        try {
            const r = await post({url: '/portal/msg', data: postForm});
            if (r.code !== 200) {
                alert("反馈异常");
                return;
            }
        } catch (e) {
            alert("反馈异常");
            return;
        }
        setFiles([]);
        setTitle('');
        setContent('');
        setFbState(1);
        onClose && onClose();
    }


    function t2s(s) {
        const start = Date.parse(s);
        const now = Date.now();
        const diff = now - start;
        if (diff < 60000) {
            return '刚刚';
        }
        if (diff < 1800000) {
            return `${Math.round(diff / 60000)}分钟前`;
        }
        if (diff < 3600000) {
            return `半小时前`;
        }
        if (diff < 24 * 3600000) {
            return `${Math.round(diff / 3600000)}小时前`;
        }
        if (diff < 30 * 24 * 3600000) {
            return `${Math.round(diff / (24 * 3600000))}天前`;
        }
        return `${Math.round(diff / (30 * 24 * 3600000))}月前`;
    }

    function onSupport(id) {
        return () => {
            get({url: `/aris/comment/support/${id}`})
                .then(r => {
                    comments.forEach(x => {
                        if (x['id'] === id) {
                            x['support'] = r['data'];
                        }
                    });
                    const n = comments.map(x => x);
                    setComments(n);
                })
                .catch(e => {
                    console.log(e)
                });
        };
    }

    const dropId = {id: '#scroll-dialog-title'}
    return (
        <div>
            <Dialog
                open={open}
                onClose={onClose}
                scroll={'body'}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
                fullWidth={true}
                maxWidth={"md"}
                hello={'ok'}
                PaperComponent={PaperComponent}
                PaperProps={dropId}
            >
                <DialogTitle style={{cursor: 'move'}} id="scroll-dialog-title"
                             onClose={onClose}>我要反馈</DialogTitle>
                <DialogContent dividers className={styles.dialogContent}>
                    <div className={styles.content}>
                        <div>
                            {isArray(comments) && comments.map((x, inx) => <div key={inx} className={styles.messageRow}>
                                <div>
                                    <Avatar variant="rounded" src={x['avatar']}>
                                        <AddAlertIcon/>
                                    </Avatar>
                                </div>
                                <div style={{width: '100%'}}>
                                    <div className={styles.messageHeader}>
                                        <div>
                                            <Typography variant="subtitle1" gutterBottom color='primary'>
                                                {x['nickName']}
                                            </Typography>
                                        </div>
                                        <div style={{flex: 1}}>

                                        </div>
                                        <div className={styles.messageHeaderRight}>
                                            {t2s(x['createTime'])}
                                        </div>
                                        <div className={styles.messageHeaderRight}>
                                            <ThumbUpIcon onClick={onSupport(x['id'])} style={{cursor: 'pointer'}}
                                                         color={'primary'}
                                                         fontSize={'small'}/>&ensp;{x['support']}
                                        </div>
                                    </div>
                                    <div className={styles.messageBox}>
                                        {x['comment'] || ''}
                                    </div>
                                    <div className={styles.messageBox}>
                                        {
                                            isArray(x['docs']) &&
                                            x['docs'].map((z, ix) => <Link style={{marginRight: 8}} target="_blank"
                                                                           underline={'hover'}
                                                                           key={`${inx}_${ix}`}
                                                                           href={`${getBaseUrl()}${z['previewUrl']}?obj_doc=1`}>{z['uri']}</Link>)
                                        }
                                    </div>
                                </div>
                            </div>)}
                        </div>

                        <div className={styles.message} key={1111}>
                            <h3>您好，非常欢迎您给我们留下宝贵的意见或者建议！谢谢！</h3>
                        </div>

                        <div className={styles.message} key={33}>
                            <h3>紧急程度</h3>
                            <RadioGroup name="urgent"
                                        defaultValue={'1'}
                                        onChange={(a, b) => setFbState(parseInt(b))}>
                                <FormControlLabel value={'1'} control={<Radio/>} label="不紧急"/>
                                <FormControlLabel value={'0'} control={<Radio/>} label="紧急"/>
                            </RadioGroup>
                        </div>
                        <div className={styles.message} key={22}>
                            <h3>标题</h3>
                            <TextField
                                id="title"
                                placeholder="标题"
                                fullWidth
                                margin="normal"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                onChange={(a, b) => {
                                    setTitle(a.target.value)
                                }}
                                autoComplete={'off'}
                                variant={'outlined'}
                            />
                        </div>
                        <div className={styles.message} key={11}>
                            <h3>您想告诉我们意见或建议是</h3>
                            <TextField
                                autoComplete={'off'}
                                id="message"
                                placeholder="您想告诉我们意见或建议是"
                                fullWidth
                                margin="normal"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                multiline
                                rows={5}
                                variant={'outlined'}
                                onChange={(a, b) => {
                                    setContent(a.target.value)
                                }}
                            />
                        </div>
                        <div key={999}>
                            <DropzoneArea dropzoneText={'拖拽或点击上传附件'}
                                          filesLimit={100}
                                          dropzoneClass={styles.dropzone}
                                          showFileNamesInPreview={true}
                                          maxFileSize={1024 * 1024 * 50}
                                          previewText={'文件'}
                                          fullWidth={true}
                                          showAlerts={false}
                                          onChange={onUploaderChange}
                                          useChipsForPreview={true}
                                          key={3}
                            />
                        </div>
                        <div className={styles.buttonArea} key={4}>
                            <Button onClick={onClickSendButton} variant="contained" color="primary"
                                    size={'large'}>
                                提交
                            </Button>
                        </div>

                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}