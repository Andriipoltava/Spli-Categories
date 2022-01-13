import React from 'react';

function NewTermsLabel({index, item, ...props}) {
    // console.log(item,index)
    return <div>
        <label><span>New term name Column {index + 1}</span>
            <input required {...props} type="text"
            />
            <span> new Term colunt :{item.filter(e => e.term_name !== '-').length}</span>
        </label>
    </div>;

}

export default NewTermsLabel;