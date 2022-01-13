import React from 'react';
import axios from 'axios';
const objectAll = window.app_object

export const UseNewTerms = (currentList, slicerReg, excludedReg, setNewTerms) => {

    let maxNewTermCount = 0, newTermArray = [];

    currentList.forEach(e => {
        maxNewTermCount = Math.max(maxNewTermCount, e.name.split(slicerReg).length)
    })
    currentList.forEach(e => {
        let maxNewTerm = e.name.split(slicerReg)
        if (maxNewTermCount >= 1)
            for (let index = 0; index < maxNewTermCount; index++) {
                if (!newTermArray[index])
                    newTermArray[index] = []
                if (excludedReg && index >= 1 && maxNewTerm[index]) {
                    maxNewTerm[index] = excludedReg + maxNewTerm[index];
                }
                if (maxNewTerm[index]) {
                    newTermArray[index].push({'term_name': maxNewTerm[index], 'old_term_id': e.term_id})

                } else {
                    newTermArray[index].push({'term_name': '-', 'old_term_id': e.term_id})
                }
            }
    })
    setNewTerms(newTermArray)


}

export const UsePreSaveTerms = (currentList, slicerReg, excludedReg, setNewTermsAjax, newTermsSetting, selectTerm, preLoader, newTerms) => {

    let newTermArray = [], count = 0
    currentList.forEach((e, i) => {
        let maxNewTerm = e.name.split(slicerReg)
        if (maxNewTerm.length >= 1)
            maxNewTerm.forEach((item, index) => {
                if (!newTermArray[index]) {
                    newTermArray[index] = []
                    newTermArray[index]['terms'] = []
                    newTermArray[index]['name'] = newTermsSetting[index]
                    newTermArray[index]['old_term'] = selectTerm
                }

                if (excludedReg && index >= 1 && item) {
                    item = excludedReg + item;
                }
                if (item)
                    newTermArray[index]['terms'][i] = {
                        'term_name': item,
                        'old_term_id': e.term_id,
                        'old_term': selectTerm
                    }

            })
    })

    let formData = new FormData();
    let newTax = newTermsSetting.filter((e, i) => newTermArray.length > i)

    const date = (new Date()).toLocaleString("en-US")

    formData.append('action', 'processAxiosDataCreateTax');
    formData.append('body', JSON.stringify({
        newTax, oldTax: selectTerm, date, newTerms, slicerReg, excludedReg,
    }));

    const ajax_url = objectAll.ajaxurl

    const config = {
        headers: {'content-type': 'multipart/form-data'}
    }
    preLoader(true)

    axios.post(ajax_url, formData, config)
        .then(response => {
            setTimeout(function () {
                setNewTermsAjax(newTermArray)
            }, 2000);
        })
        .catch(error => {
            preLoader(false)
            console.log(error);
        });

}

export const UseAjaxTerms = (currentList, newTermsAjax, slicerReg, excludedReg, setNewTermsAjax, newTermsSetting, selectTerm, newTerms, preLoader) => {

    const termsAjax = newTermsAjax
    let sendTerm = [], counter = 10, step = counter, ajaxCount = 0

    let long = termsAjax.reduce((acc, item) => {
        acc += item.terms.filter(e => e.term_name !== '-').length
        return acc
    }, 0)
    let longAll = newTerms?.reduce((acc, item) => {
        acc += item.filter(e => e.term_name !== '-').length
        return acc
    }, 0)

    if (termsAjax.length) {
        termsAjax.forEach((term, index_term) => {
            if (term.terms) {
                // console.log('test', typeof term.terms, term.term, Array.isArray(term.terms))
                term.terms.forEach((item, index) => {
                    if (counter) {
                        if (!sendTerm[index_term]) {
                            sendTerm[index_term] = {}
                            sendTerm[index_term].terms = {}
                            sendTerm[index_term].terms[index] = {}
                        }
                        sendTerm[index_term].name = term.name
                        sendTerm[index_term].old_term = term.old_term
                        sendTerm[index_term].terms[index] = item
                        termsAjax[index_term].terms = [...termsAjax[index_term].terms.filter(e => item !== e)]
                        counter -= 1;
                    }
                })
            }
        })


        if (termsAjax && sendTerm.length) {
            const ajax_url = objectAll.ajaxurl
            let formData = new FormData();
            let body = JSON.stringify({
                selectTerm,
                slicerReg,
                excludedReg,
                long,
                step,
                newTerms,
                newTermsSetting
            })
            formData.append('action', 'processAxiosDataCreateTerm');
            formData.append('body', body);
            formData.append('newTerm', JSON.stringify(sendTerm));

            const config = {
                headers: {'content-type': 'multipart/form-data'}
            }
            preLoader(true, longAll, long)

            axios.post(ajax_url, formData, config)
                .then(response => {
                    setTimeout(function () {
                        if (long - 10 < 0){
                            location.reload();
                        }
                        ajaxCount++
                        setNewTermsAjax([...termsAjax])
                        // console.log({selectTerm, slicerReg, excludedReg, newTermsSetting, long, step, sendTerm, newTerms})
                    }, 1000);

                })
                .catch(error => {
                    preLoader(false)
                    console.log(error);
                });
        }
    }
}

