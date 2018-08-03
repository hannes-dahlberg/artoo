<template>
    <modal-component ref="modal">
        <template slot="header">
            <h5 class="modal-title" v-html="title"></h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </template>
        <template slot="body">
            <span v-html="content"></span>
        </template>
        <template slot="footer">
            <template v-if="type == 'yesno'">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">No</button>
                <button type="button" class="btn btn-primary" v-on:click="close">Yes</button>
            </template>
            <template v-else>
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" v-on:click="close">Confirm</button>
            </template>
        </template>
    </modal-component>
</template>
<script lang="ts">
    import modalComponent from './modal'

    export type confirmType = 'yesno'|'ok'

    export default {
        components: { modalComponent },
        props: ['title', 'content', 'type'],
        methods: {
            confirm({ beforeClose = null, beforeDismiss = null} : { beforeClose?: () => Promise<void>, beforeDismiss?: () => Promise<void> }): Promise<boolean> {
                return new Promise((resolve, reject) => {
                    this.$refs['modal'].asPromise({ beforeClose, beforeDismiss }).then((data) => {
                        if(data.type == 'close') { resolve(true); return }
                        resolve(false);
                    })
                })
            }
            close() {
                this.$refs['modal'].close()
            }
            dismiss() {
                this.$refs['modal'].dismiss()
            }
        }
    }
</script>