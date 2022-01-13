import React, {useEffect, useMemo, useRef, useState} from 'react'
import DropdownTerm from "./component/UI/dropdownTerm";
import NewTermsLabel from "./component/UI/newTermsLabel";
import InputReg from "./component/UI/inputReg";
import ListTerms from "./component/UI/listTerms";
import {UseNewTerms, UsePreSaveTerms, UseAjaxTerms} from "./hooks/useNewTerms";
import './style/split_categories.css'
import OldList from "./oldList";

const objectAll = window.app_object

export default function splitСategories(props) {
    const [taxonomy, setTaxonomy] = useState({})
    const [slicerReg, setSlicerReg] = useState()
    const [excludedReg, setExcludedReg] = useState()
    const [selectTerm, setSelectTerm] = useState()
    const [currentList, setCurrentList] = useState()
    const [newTerms, setNewTerms] = useState()
    const [preloadVisible, setPreloadVisible] = useState(0)
    const [newTermsSetting, setNewTermsSetting] = useState([])
    const [newTermsAjax, setNewTermsAjax] = useState([])

    useEffect(() => {
        setTaxonomy(objectAll.taxonomy)
    }, [])

    useEffect(() => {
        preLoader(true)
        const timeoutID = window.setTimeout(newTerm, 500);
        return () => window.clearTimeout(timeoutID);

    }, [selectTerm, slicerReg, excludedReg])


    useEffect(() => {

        UseAjaxTerms(currentList, newTermsAjax, slicerReg, excludedReg, setNewTermsAjax, newTermsSetting, selectTerm, newTerms, preLoader)
    }, [newTermsAjax])


    const newTerm = () => {
        if (slicerReg && selectTerm) {
            UseNewTerms(currentList, slicerReg, excludedReg, setNewTerms)
        }
        preLoader(false)
    }

    const inputChange = (index, value) => {
        const newState = [...newTermsSetting]
        newState[index] = value.replace(/[^A-Za-z0-9\-]/g, '-')
        setNewTermsSetting(newState)

    }
    const inputExcludedReg = (e) => {
        if (slicerReg.indexOf(e.target.value) !== -1)
            setExcludedReg(e.target.value)

    }
    const inputSlitReg = (e) => {

        setSlicerReg(e.target.value)
        if (excludedReg)
            setExcludedReg('')
    }
    const preloaderStyle = {
        display: preloadVisible < 100 ? 'flex' : 'none',
    }

    let t = newTerms?.map((item, index) => {
        if (newTermsSetting[index] === '')
            return false;
        else if (newTermsSetting[index] === undefined)
            return false;
        return true;
    })
    const isTrue = (element) => !element !== undefined && element === true;
    t = t ? t.every(isTrue) : false;
    const saveBtn = {
        background: t ? '#0a4b78' : '#4d555d',
        pointerEvents: t ? 'auto' : 'none',
    }

    const preLoader = (load, finish = 100, current = 0) => {
        if (load === false) return setPreloadVisible(100)
        if (load && finish === 100 && current === 0) return setPreloadVisible(0)
        if (current > finish) setPreloadVisible(100)
        setPreloadVisible(parseInt(100 - (100 / finish * current)))
    }
    const saveNewTerm = (e) => {
        e.preventDefault()
        UsePreSaveTerms(currentList, slicerReg, excludedReg, setNewTermsAjax, newTermsSetting, selectTerm, preLoader,newTerms)
    }


    return (
        <div className={'splitCategories'}>
            <h2 className={'splitCategories__Title'}> Split categories </h2>
            <OldList/>
            <div className={'splitCategories__TopWrap'}>
                <div className={'splitCategories__TopWrap__SelectTax'}>
                    <label htmlFor="">
                        Taxonomic
                        <DropdownTerm taxonomyList={taxonomy} value={selectTerm} onChange={e => {
                            setSelectTerm(e.target.value);
                            setCurrentList(taxonomy[e.target.value]?.all_terms
                            )
                        }}/>
                    </label>
                </div>
                <div className={'splitCategories__TopWrap__RegExp'}>
                    <InputReg slicerReg={slicerReg} inputExcludedReg={inputExcludedReg} inputSlitReg={inputSlitReg}
                              excludedReg={excludedReg}
                    />
                </div>
                <div className={'splitCategories__TopWrap__NewTax'}>
                    {newTerms?.map((item, index) =>

                        <NewTermsLabel key={index + 'TermsNames'} item={item} index={index}
                                       onChange={e => inputChange(index, e.target.value)}
                                       value={newTermsSetting[index]}/>
                    )}
                </div>
                <button style={saveBtn} className={'splitCategories__TopWrap__Save'} onClick={saveNewTerm}>Save New
                    Term
                </button>
            </div>
            <div className={'splitCategories__Counter'}>
                {currentList ? ' Count ' + currentList.length : ''}
            </div>
            <br/>
            <div className={'splitCategories__List'}>
                <ListTerms currentList={currentList} preloaderStyle={preloaderStyle} preloadVisible={preloadVisible}
                           newTerms={newTerms}/>
            </div>
        </div>
    );
}


