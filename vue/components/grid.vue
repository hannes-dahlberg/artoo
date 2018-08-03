<template>
    <table class="dw-grid">
        <thead>
            <tr>
                <th v-if="options.showIndex" scope="col">#</th>
                <th v-for="field in fields" scope="col" :class="field.class" :style="field.style" v-html="field.title"></th>
            </tr>
        </thead>
        <tbody>
            <tr v-if="isEmpty"><td style="width: 100%;" :colspan="fields.length + (options.showIndex ? 1 : 0)" v-html="options.emptyPlaceholder"></td></tr>
            <tr v-for="(row, index) in data">
                <th v-if="options.showIndex" scope="row">{{ index + 1 }}</th>
                <td v-for="field in fields" :class="field.class" :style="field.style">
                    <span v-html="getValue(row, index, field.value)"></span>
                    <template v-for="action in field.actions">
                        <router-link v-if="action.route" v-tooltip :title="action.tooltip" class="action" :to="getValue(row, index, action.route)" v-html="getValue(row, index, action.value)"></router-link>
                        <span v-else v-tooltip :title="action.tooltip" class="action" style="cursor: pointer" v-on:click.prevent="actionClick(row, index, action)" v-html="getValue(row, index, action.value)"></span>
                    </template>
                </td>
            </tr>
        </tbody>
    </table>
</template>
<script lang="ts">
    import { Route } from 'vue-router'
    export type action = {
        name: string,
        route?: (row: any, index: number) => Route | Route | string,
        data?: any,
        value: (row: any, index: number) => any | string,
        tooltip?: string
    };
    export type field = {
        name: string,
        title: string,
        value: (row: any, index: number) => any,
        actions: action[],
        class?: string,
        style?: string
    }
    export type gridOptions = {
        fields: string[],
        showIndex: boolean,
        emptyPlaceholder: string
    }
    //Type for input action click event method
    export type actionClickEvent = (arg: { row: any, index: number, data?: any }) => void
    export default {
        props: ['data', 'options', 'actionClickEvent'],
        computed: {
            fields() { return this.options.fields },
            isEmpty() { return !this.data || !this.data.length }
        },
        methods: {
            actionClick(row: any, index: number, action: action) {
                this.$emit('action-click-event', {
                    name: action.name,
                    row,
                    index,
                    ...(action.data ? { data: this.getValue(row, index, action.data) } : null)
                )
            }
            getValue(row, index, value: any) {
                if(typeof value == 'function') {
                    return value(row, index);
                } else {
                    return value;
                }
            }
        }
    }
</script>