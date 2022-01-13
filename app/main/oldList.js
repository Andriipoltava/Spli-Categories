import React from 'react';
import './style/oldLIst.css'

const objectAll = window.app_object

function OldList(props) {
    return (
        <div>
            {objectAll?.old_tax.length ?
                <table className={'oldList'}>
                    <thead>
                    <tr>
                        <th>Index</th>
                        <th> New Taxonomic</th>
                        <th> Old Taxonomic</th>
                        <th>Date</th>
                        <th>Count New term</th>
                    </tr>
                    </thead>
                    <tbody>
                    {objectAll.old_tax.map((items, index) => {
                        console.log(items)
                        let count = items.newTerms.filter(e => e.term_name !== '-').length
                        return <tr key={index}>
                            <th>{index + 1} </th>
                            <th> {items.new}</th>
                            <th> {items.old}</th>
                            <th>{items.date}</th>
                            <th> {count}</th>
                        </tr>

                    })}
                    </tbody>
                </table>
                : ''}
        </div>
    )

}

export default OldList;