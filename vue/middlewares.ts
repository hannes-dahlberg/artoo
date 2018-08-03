import axios from 'axios';

import { nextLocation } from './router';

//Guard for setting axios auth token if not already set
export let setAuth = (to: Route, from: Route, next: nextLocation) => {
    if(store.getters.isAuth && !axios.defaults.headers.common['Authorization']) {
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + store.getters.getToken
        axios.defaults.withCredentials = true;
    } else if(!store.getters.isAuth && axios.defaults.headers.common['Authorization'] !== undefined) {
        delete axios.defaults.headers.common['Authorization'];
        axios.defaults.withCredentials = false;
    }

    next()
}