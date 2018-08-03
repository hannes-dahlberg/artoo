<template>
    <div class="modal fade" tabindex="-1" role="dialog" ref="modal">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <slot name="header"></slot>
                </div>
                <div class="modal-body">
                    <slot name="body"></slot>
                </div>
                <div class="modal-footer">
                    <slot name="footer"></slot>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    export default {
        data: () => ({
            eventListner: null,
            closed: false,
            beforeClose: null,
            beforeDismiss: null
        }),
        mounted() {
            //Register event listner on mounted to detect modal dismiss
            this.eventListner = $(this.$refs['modal']).on('hidden.bs.modal', (event) => {
                //If modal is not already closed call dismiss method
                if(!this.closed) { this.dismiss(); }
            })
        },
        destroyed() {
            //Make sure to destroy the event listner once its no longer needed
            this.eventListner.off()
        },
        methods: {
            asPromise({ beforeClose = null, beforeDismiss = null} : { beforeClose?: () => Promise<void>, beforeDismiss?: () => Promise<void> }) {
                if(beforeClose) {
                    this.beforeClose = beforeClose
                }
                if(beforeDismiss) {
                    this.beforeDismiss = beforeDismiss
                }
                return new Promise((resolve, reject) => {
                    this.show();
                    this.$on('close', () => {
                        resolve({ type: 'close' })
                    })
                    this.$on('dismiss', () => {
                        resolve({ type: 'dismiss' })
                    })
                });
            },
            show() {
                this.closed = false
                $(this.$refs['modal']).modal('show')
                this.$emit('show')
            },
            close(dismiss: boolean = false) {
                let beforeName = 'before' + (dismiss ? 'Dismiss' : 'Close')
                if(this[beforeName]) {
                    this[beforeName]().then(() => {
                        this[beforeName] = null
                        this.close(dismiss)
                    })
                    return
                }
                this.closed = true
                this.$emit(dismiss ? 'dismiss' : 'close')
                $(this.$refs['modal']).modal('hide')
            },
            dismiss() {
                this.close(true)
            }
        }
    }
</script>