import {SET_ACTIVE_PAGE,SET_PLC_DATA} from './mutations-type.js'
export default {
    [SET_ACTIVE_PAGE]: (state, page) => {
        console.log('set active page',page);
        state.activePage=page
        // state.activePage=page
    },
    [SET_PLC_DATA]:(state,data)=>{
        state.plcData=data
    }
}