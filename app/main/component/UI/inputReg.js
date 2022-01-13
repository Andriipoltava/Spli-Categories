import React from 'react';

function InputReg({slicerReg, excludedReg, inputExcludedReg, inputSlitReg, ...props}) {
    return (
        <div>
            <label htmlFor=""> split Reg
                <input type="text" name='' value={slicerReg}
                       onInput={inputSlitReg}/>
            </label>
            <label htmlFor=""> excluded first occurrence
                <input type="text" name='' value={excludedReg}
                       onInput={inputExcludedReg}/>
            </label>
        </div>
    );
}

export default InputReg;