import React from 'react';

function ListTerms({currentList, preloaderStyle, newTerms, preloadVisible, ...props}) {
    const renderNewTerm = () => {
        if (newTerms) {
            return newTerms.map((item, index_item) =>
                <div className={'listTerm__wrap__new'} key={index_item + 'parent'}>
                    {item.map((term, index) => <div
                        key={index + '_' + term.old_term_id + '_lists'}>{term.term_name}</div>)}</div>
            )
        }
    }
    return (
        <div style={{position: 'relative'}} className={'listTerm'}>
            <div  className={'listTerm__preload'} style={preloaderStyle}>    {preloadVisible===0?'': preloadVisible+'%'}</div>


                <div className={'listTerm__wrap'} style={{display: 'flex'}}>
                    <div className={'listTerm__wrap__current'}>
                        {currentList ? currentList.map((t, index) =>
                            <div key={index}>{t.name}</div>
                        ) : ''}
                    </div>
                    {renderNewTerm()}
                </div>

        </div>
    );
}

export default ListTerms;