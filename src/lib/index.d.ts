/// <reference types="svelte" />

declare module 'saos' {
    import type { SvelteComponentTyped } from 'svelte';

    export default class Saos extends SvelteComponentTyped<{
        animation?: string;
        animation_out?: string;
        once?: boolean;
        top?: number;
        bottom?: number;
        css_observer?: string;
        css_animation?: string;
    }> {}
}
