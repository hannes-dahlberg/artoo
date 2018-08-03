import * as model from './modules/orm/model';
import * as relation from './modules/orm/relation';
import * as statement from './modules/orm/statement';

import * as helpers from './modules/helpers'
import * as migrate from './modules/migrate';
import * as prom from './modules/prom';
import * as storage from './modules/storage';

export let Artoo = {
    ORM: {
        ...model,
        ...relation,
        ...statement
    },
    helpers,
    Prom: prom.Prom,
    prom: prom,
    storage
}