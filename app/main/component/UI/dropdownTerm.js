import React from 'react';

function DropdownTerm({taxonomyList, ...props}) {
    if (taxonomyList) {
        return <select {...props} >
            <option> --</option>
            {Object.keys(taxonomyList).map((t, index) =>
                <option key={index + 'options'} value={taxonomyList[t].name}>{taxonomyList[t].label}</option>
            )}
        </select>;
    } else
        return <h2>Not terms</h2>
}

export default DropdownTerm;