import React, {useEffect, useState} from 'react';
import {Row, Col, Input, Divider,} from 'antd';
import {useHistory} from 'react-router-dom';
import './ArisSearch.css';
import {searchSymbol} from '../../api/SymbolSearchApi';
import {toMap} from "../../utils/url";
import {VIEWER_URL} from "../../route/router";

export function ArisSearch() {

    const [searchList, setSearchList] = useState([]);
    const [catSumInfoList, setCatSumInfoList] = useState([]);
    const his = useHistory();
    const [searchValue,setSearchValue] = useState('');

    async function doSearch(searchKey, pageNo, pageSize) {
        if(!pageNo){
            pageNo=1;
        }
        if(!pageSize){
            pageSize=30;
        }
        const ret = await searchSymbol({searchKey, pageNo, pageSize});
        if (ret && ret.data) {
            const {list, searchKey, catSumInfo} = ret.data;
            setCatSumInfoList(catSumInfo);
            setSearchList(list);
            return;
        }
        setSearchList([]);
    }


    function queryParams() {
        const {search} = his.location;
        return toMap(search);
    }

    useEffect(() => {
        const p = queryParams();
        if (p['page'] === 'search' && p['search_key']) {
            setSearchValue(p['search_key']);
            const pn= p['page_no'];
            let ps=p['pageSize'];
            doSearch(p['search_key'], p['page_no'], p['page_size']).catch(e => {
            });
        }
    }, [his.location]);


    async function onEnter(v, e) {
        const currentText = v;
        if (!currentText) {
            setSearchList([]);
            return;
        }
        const p = queryParams();

        his.push(`${his.location.pathname}?page=search&search_key=${currentText}`);
    }


    const base = `${VIEWER_URL}?id=`;

    function renderSearchResult() {
        let divider = null;
        const dd = <Divider/>;
        return searchList.map((x, inx) => {
            if (divider == null) {
                divider = dd;
            }
            const {target, path} = x;
            return <div key={`${inx}__`}>
                {divider}
                <div key={`cc_${inx}`} className={'search-result'}>
                    <p className={'result-title'}>
                        {target['name']}<span className={'model-type'}> [ {target['isModel'] ? '模型' : '对象'} ] </span>
                    </p>
                    <div>
                        {
                            path.map((y, ix) => {
                                const len = y.length;
                                return <p key={`dd_${inx}_${ix}`}>
                                    {
                                        y.map((z, i) => {
                                            const {id, name} = z;
                                            return [<a className={'row-item'}
                                                       key={`link_${inx}_${ix}_${i}`}
                                                       href={`${base}${id}${i + 1 === len && !target['isModel'] ? ('&symbol=' + target['id']) : ''}`}>{name}
                                            </a>,
                                                i + 1 === len ? null : <span key={`span_${inx}_${ix}_${i}`}
                                                                             className={'link-splitter'}>{'/'}</span>
                                            ];
                                        })
                                    }
                                </p>;
                            })
                        }
                    </div>
                </div>
            </div>;
        });
    }


    return (
        <div className={'search-container'}>
            <Row className={'search-input'}>
                <Col span={12} offset={6}>
                    <Input.Search defaultValue={searchValue} onSearch={onEnter} allowClear={true} size={'large'}
                                  placeholder={'搜索一下'} icon={'search'}/>
                </Col>
            </Row>
            <Row>
                {/*<Col span={4}>*/}
                {/*    <div className={'search-cat'}>*/}
                {/*        {catSumInfoList && catSumInfoList.length > 0 ? <h3>分类</h3> : null}*/}
                {/*        {*/}
                {/*            catSumInfoList.map((x, inx) => {*/}
                {/*                return <div className={'cat-link'} key={`ct__${inx}`}><a onClick={e => clickCat()}*/}
                {/*                                                                         href={'#'}>{x.cn} ( {x.rc} )</a>*/}
                {/*                </div>;*/}
                {/*            })*/}
                {/*        }*/}
                {/*    </div>*/}
                {/*</Col>*/}
                <Col span={24}>
                    {renderSearchResult()}
                </Col>

            </Row>
        </div>
    );
}