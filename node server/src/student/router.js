import Router from 'koa-router';
import angajatStore from './store';
import {broadcast} from "../utils";

export const router = new Router();

router.get('/', async (ctx) => {
    const response = ctx.response;
    const departament = ctx.state.user.departament;
    response.body = await angajatStore.find({departament});
    response.status = 200; // ok


});
router.get('/:id', async (ctx) => {
    const userId = ctx.state.user._id;
    const departament = ctx.state.user.departament;

    const st = await angajatStore.findOne({_id: ctx.params.id});
    const response = ctx.response;
    if (st) {
        if (st.departament === departament) {
            response.body = st;
            response.status = 200; // ok
        } else {
            response.status = 403; // forbidden
        }
    } else {
        response.status = 404; // not found
    }
});

router.put('/:id', async (ctx) => {
    const st = ctx.request.body;
    const id = ctx.params.id;
    const stId = st._id;
    const response = ctx.response;
    if (stId && stId !== id) {
        response.body = { message: 'Param id and body _id should be the same' };
        response.status = 400; // bad request
        return;
    }
    if (!stId) {
        await createAngajat(ctx, st, response);
    } else {
        const userId = ctx.state.user._id;
        st.userId = userId;
        st.departament=ctx.state.user.departament;
        st.active="false";

        const updatedCount = await angajatStore.update({ _id: id }, st);
        if (updatedCount === 1) {
            response.body =st;
            response.status = 200; // ok
            broadcast(userId, { type: 'updated', payload: st });
        } else {
            response.body = { message: 'Resource no longer exists' };
            response.status = 405; // method not allowed
        }
    }
});

const createAngajat = async (ctx, angajat, response) => {
    try {

        console.log(ctx.request.body)
        const departament = ctx.state.user.departament;
        angajat.departament = departament;
        angajat.active = "false";
        response.body = await angajatStore.insert(angajat);

        response.status = 201; // created
        broadcast(departament, {type: 'created', payload: angajat});
    } catch (err) {
        response.body = {message: err.message};
        response.status = 400; // bad request
    }
};
router.post('/', async ctx => {
    await createAngajat(ctx, ctx.request.body, ctx.response)
})
;

router.post('/signup', async ctx => {
    await createAngajat(ctx, ctx.request.body, ctx.response)
});


