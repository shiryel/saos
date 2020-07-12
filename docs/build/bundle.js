
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function t(){}function n(t){return t()}function e(){return Object.create(null)}function o(t){t.forEach(n);}function r(t){return "function"==typeof t}function i(t,n){return t!=t?n==n:t!==n||t&&"object"==typeof t||"function"==typeof t}function c(t,n,e,o){if(t){const r=u(t,n,e,o);return t[0](r)}}function u(t,n,e,o){return t[1]&&o?function(t,n){for(const e in n)t[e]=n[e];return t}(e.ctx.slice(),t[1](o(n))):e.ctx}function s(t,n,e,o,r,i,c){const s=function(t,n,e,o){if(t[2]&&o){const r=t[2](o(e));if(void 0===n.dirty)return r;if("object"==typeof r){const t=[],e=Math.max(n.dirty.length,r.length);for(let o=0;o<e;o+=1)t[o]=n.dirty[o]|r[o];return t}return n.dirty|r}return n.dirty}(n,o,r,i);if(s){const r=u(n,e,o,c);t.p(r,s);}}function l(t,n,e){t.insertBefore(n,e||null);}function a(t){t.parentNode.removeChild(t);}function f(t){return document.createElement(t)}function d(t,n,e){null==e?t.removeAttribute(n):t.getAttribute(n)!==e&&t.setAttribute(n,e);}let m;function p(t){m=t;}function $(t){(function(){if(!m)throw new Error("Function called outside component initialization");return m})().$$.on_mount.push(t);}const g=[],h=[],b=[],y=[],_=Promise.resolve();let v=!1;function x(t){b.push(t);}let w=!1;const E=new Set;function A(){if(!w){w=!0;do{for(let t=0;t<g.length;t+=1){const n=g[t];p(n),I(n.$$);}for(g.length=0;h.length;)h.pop()();for(let t=0;t<b.length;t+=1){const n=b[t];E.has(n)||(E.add(n),n());}b.length=0;}while(g.length);for(;y.length;)y.pop()();v=!1,w=!1,E.clear();}}function I(t){if(null!==t.fragment){t.update(),o(t.before_update);const n=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,n),t.after_update.forEach(x);}}const M=new Set;let O;function j(t,n){t&&t.i&&(M.delete(t),t.i(n));}function k(t,n,e,o){if(t&&t.o){if(M.has(t))return;M.add(t),O.c.push(()=>{M.delete(t),o&&(e&&t.d(1),o());}),t.o(n);}}function B(t,n){-1===t.$$.dirty[0]&&(g.push(t),v||(v=!0,_.then(A)),t.$$.dirty.fill(0)),t.$$.dirty[n/31|0]|=1<<n%31;}function L(i,c,u,s,l,f,d=[-1]){const $=m;p(i);const g=c.props||{},h=i.$$={fragment:null,ctx:null,props:f,update:t,not_equal:l,bound:e(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map($?$.$$.context:[]),callbacks:e(),dirty:d};let b=!1;if(h.ctx=u?u(i,g,(t,n,...e)=>{const o=e.length?e[0]:n;return h.ctx&&l(h.ctx[t],h.ctx[t]=o)&&(h.bound[t]&&h.bound[t](o),b&&B(i,t)),n}):[],h.update(),b=!0,o(h.before_update),h.fragment=!!s&&s(h.ctx),c.target){if(c.hydrate){const t=function(t){return Array.from(t.childNodes)}(c.target);h.fragment&&h.fragment.l(t),t.forEach(a);}else h.fragment&&h.fragment.c();c.intro&&j(i.$$.fragment),function(t,e,i){const{fragment:c,on_mount:u,on_destroy:s,after_update:l}=t.$$;c&&c.m(e,i),x(()=>{const e=u.map(n).filter(r);s?s.push(...e):o(e),t.$$.on_mount=[];}),l.forEach(x);}(i,c.target,c.anchor),A();}p($);}function C(t){let n,e,o;const r=t[10].default,i=c(r,t,t[9],null);return {c(){n=f("div"),i&&i.c(),d(n,"style",e="animation: "+t[1]+"; "+t[3]);},m(t,e){l(t,n,e),i&&i.m(n,null),o=!0;},p(t,c){i&&i.p&&512&c&&s(i,r,t,t[9],c,null,null),(!o||10&c&&e!==(e="animation: "+t[1]+"; "+t[3]))&&d(n,"style",e);},i(t){o||(j(i,t),o=!0);},o(t){k(i,t),o=!1;},d(t){t&&a(n),i&&i.d(t);}}}function N(t){let n,e,o;const r=t[10].default,i=c(r,t,t[9],null);return {c(){n=f("div"),i&&i.c(),d(n,"style",e="animation: "+t[0]+"; "+t[3]);},m(t,e){l(t,n,e),i&&i.m(n,null),o=!0;},p(t,c){i&&i.p&&512&c&&s(i,r,t,t[9],c,null,null),(!o||9&c&&e!==(e="animation: "+t[0]+"; "+t[3]))&&d(n,"style",e);},i(t){o||(j(i,t),o=!0);},o(t){k(i,t),o=!1;},d(t){t&&a(n),i&&i.d(t);}}}function S(t){let n,e,r,i;const c=[N,C],u=[];function s(t,n){return t[4]?0:1}return e=s(t),r=u[e]=c[e](t),{c(){n=f("div"),r.c(),d(n,"id",t[5]),d(n,"style",t[2]);},m(t,o){l(t,n,o),u[e].m(n,null),i=!0;},p(t,[l]){let a=e;e=s(t),e===a?u[e].p(t,l):(O={r:0,c:[],p:O},k(u[a],1,1,()=>{u[a]=null;}),O.r||o(O.c),O=O.p,r=u[e],r||(r=u[e]=c[e](t),r.c()),j(r,1),r.m(n,null)),(!i||4&l)&&d(n,"style",t[2]);},i(t){i||(j(r),i=!0);},o(t){k(r),i=!1;},d(t){t&&a(n),u[e].d();}}}function q(t,n,e){let{animation:o="none"}=n,{animation_out:r="none; opacity: 0"}=n,{once:i=!1}=n,{top:c=0}=n,{bottom:u=0}=n,{css_observer:s=""}=n,{css_animation:l=""}=n,a=!0;const f=`__saos-${Math.random()}__`;function d(t){const n=t.getBoundingClientRect();return e(4,a=n.top+c<window.innerHeight&&n.bottom-u>0),a&&i&&window.removeEventListener("scroll",verify),window.addEventListener("scroll",d),()=>window.removeEventListener("scroll",d)}$(()=>{const t=document.getElementById(f);return IntersectionObserver?(console.debug("using intersection observer"),function(t){const n=new IntersectionObserver(o=>{e(4,a=o[0].isIntersecting),a&&i&&n.unobserve(t);},{rootMargin:`${-u}px 0px ${-c}px 0px`});return n.observe(t),()=>n.unobserve(t)}(t)):(console.debug("using bounding"),d(t))});let{$$slots:m={},$$scope:p}=n;return t.$set=t=>{"animation"in t&&e(0,o=t.animation),"animation_out"in t&&e(1,r=t.animation_out),"once"in t&&e(6,i=t.once),"top"in t&&e(7,c=t.top),"bottom"in t&&e(8,u=t.bottom),"css_observer"in t&&e(2,s=t.css_observer),"css_animation"in t&&e(3,l=t.css_animation),"$$scope"in t&&e(9,p=t.$$scope);},[o,r,s,l,a,f,i,c,u,p,m]}class Saos extends class{$destroy(){!function(t,n){const e=t.$$;null!==e.fragment&&(o(e.on_destroy),e.fragment&&e.fragment.d(n),e.on_destroy=e.fragment=null,e.ctx=[]);}(this,1),this.$destroy=t;}$on(t,n){const e=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return e.push(n),()=>{const t=e.indexOf(n);-1!==t&&e.splice(t,1);}}$set(){}}{constructor(t){super(),L(this,t,q,S,i,{animation:0,animation_out:1,once:6,top:7,bottom:8,css_observer:2,css_animation:3});}}

    /* src/Animations.svelte generated by Svelte v3.24.0 */
    const file = "src/Animations.svelte";

    // (280:2) <Saos animation={'from-left 2s cubic-bezier(0.35, 0.5, 0.65, 0.95) both'}>
    function create_default_slot_12(ctx) {
    	let div;
    	let p0;
    	let t0;
    	let br;
    	let t1;
    	let t2;
    	let p1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text("From Left\n        ");
    			br = element("br");
    			t1 = text("\n        (Repeat)");
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = `${`animation={'from-left 2s cubic-bezier(0.35, 0.5, 0.65, 0.95) both'}`}`;
    			add_location(br, file, 283, 8, 5286);
    			attr_dev(p0, "class", "svelte-1jmbafy");
    			add_location(p0, file, 281, 6, 5256);
    			attr_dev(p1, "class", "svelte-1jmbafy");
    			add_location(p1, file, 286, 6, 5327);
    			attr_dev(div, "class", "svelte-1jmbafy");
    			add_location(div, file, 280, 4, 5244);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(p0, br);
    			append_dev(p0, t1);
    			append_dev(div, t2);
    			append_dev(div, p1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_12.name,
    		type: "slot",
    		source: "(280:2) <Saos animation={'from-left 2s cubic-bezier(0.35, 0.5, 0.65, 0.95) both'}>",
    		ctx
    	});

    	return block;
    }

    // (293:2) <Saos     once={true}     animation={'from-left 2s cubic-bezier(0.35, 0.5, 0.65, 0.95) both'}>
    function create_default_slot_11(ctx) {
    	let div;
    	let p0;
    	let t0;
    	let br0;
    	let t1;
    	let t2;
    	let p1;
    	let t3_value = `once={true}` + "";
    	let t3;
    	let t4;
    	let br1;
    	let t5;
    	let t6_value = `animation={'from-left 2s cubic-bezier(0.35, 0.5, 0.65, 0.95) both'}` + "";
    	let t6;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text("From Left\n        ");
    			br0 = element("br");
    			t1 = text("\n        (No Repeat)");
    			t2 = space();
    			p1 = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			br1 = element("br");
    			t5 = space();
    			t6 = text(t6_value);
    			add_location(br0, file, 298, 8, 5587);
    			attr_dev(p0, "class", "svelte-1jmbafy");
    			add_location(p0, file, 296, 6, 5557);
    			add_location(br1, file, 303, 8, 5667);
    			attr_dev(p1, "class", "svelte-1jmbafy");
    			add_location(p1, file, 301, 6, 5631);
    			attr_dev(div, "class", "svelte-1jmbafy");
    			add_location(div, file, 295, 4, 5545);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(p0, br0);
    			append_dev(p0, t1);
    			append_dev(div, t2);
    			append_dev(div, p1);
    			append_dev(p1, t3);
    			append_dev(p1, t4);
    			append_dev(p1, br1);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11.name,
    		type: "slot",
    		source: "(293:2) <Saos     once={true}     animation={'from-left 2s cubic-bezier(0.35, 0.5, 0.65, 0.95) both'}>",
    		ctx
    	});

    	return block;
    }

    // (310:2) <Saos     animation={'scale-in-center 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}>
    function create_default_slot_10(ctx) {
    	let div;
    	let p0;
    	let t1;
    	let p1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			p0.textContent = "Scale In Center";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = `${`animation={'scale-in-center 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}`}`;
    			attr_dev(p0, "class", "svelte-1jmbafy");
    			add_location(p0, file, 312, 6, 5897);
    			attr_dev(p1, "class", "svelte-1jmbafy");
    			add_location(p1, file, 313, 6, 5926);
    			attr_dev(div, "class", "svelte-1jmbafy");
    			add_location(div, file, 311, 4, 5885);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(div, t1);
    			append_dev(div, p1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(310:2) <Saos     animation={'scale-in-center 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}>",
    		ctx
    	});

    	return block;
    }

    // (320:2) <Saos     animation={'rotate-in-center 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}>
    function create_default_slot_9(ctx) {
    	let div;
    	let p0;
    	let t1;
    	let p1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			p0.textContent = "Rotate In Center";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = `${`animation={'rotate-in-center 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}`}`;
    			attr_dev(p0, "class", "svelte-1jmbafy");
    			add_location(p0, file, 322, 6, 6167);
    			attr_dev(p1, "class", "svelte-1jmbafy");
    			add_location(p1, file, 323, 6, 6197);
    			attr_dev(div, "class", "svelte-1jmbafy");
    			add_location(div, file, 321, 4, 6155);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(div, t1);
    			append_dev(div, p1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(320:2) <Saos     animation={'rotate-in-center 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}>",
    		ctx
    	});

    	return block;
    }

    // (330:2) <Saos     animation={'slide-in-top 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}>
    function create_default_slot_8(ctx) {
    	let div;
    	let p0;
    	let t1;
    	let p1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			p0.textContent = "Slide In Top";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = `${`animation={'slide-in-top 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}`}`;
    			attr_dev(p0, "class", "svelte-1jmbafy");
    			add_location(p0, file, 332, 6, 6435);
    			attr_dev(p1, "class", "svelte-1jmbafy");
    			add_location(p1, file, 333, 6, 6461);
    			attr_dev(div, "class", "svelte-1jmbafy");
    			add_location(div, file, 331, 4, 6423);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(div, t1);
    			append_dev(div, p1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(330:2) <Saos     animation={'slide-in-top 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}>",
    		ctx
    	});

    	return block;
    }

    // (340:2) <Saos     animation={'slide-in-fwd-tr 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}     animation_out={'scale-out-center 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both'}     top={250}     bottom={250}>
    function create_default_slot_7(ctx) {
    	let div;
    	let p0;
    	let t0;
    	let br0;
    	let t1;
    	let t2;
    	let p1;
    	let t3_value = `animation={'slide-in-fwd-tr 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}` + "";
    	let t3;
    	let t4;
    	let br1;
    	let t5;

    	let t6_value = `
        animation_out={'scale-out-center 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both'}` + "";

    	let t6;
    	let t7;
    	let br2;
    	let t8;
    	let t9_value = `top={250}` + "";
    	let t9;
    	let t10;
    	let br3;
    	let t11;
    	let t12_value = `bottom={250}` + "";
    	let t12;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text("Slide in Fwd / scale Out Center\n        ");
    			br0 = element("br");
    			t1 = text("\n        (250 top/bottom)");
    			t2 = space();
    			p1 = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			br1 = element("br");
    			t5 = space();
    			t6 = text(t6_value);
    			t7 = space();
    			br2 = element("br");
    			t8 = space();
    			t9 = text(t9_value);
    			t10 = space();
    			br3 = element("br");
    			t11 = space();
    			t12 = text(t12_value);
    			add_location(br0, file, 347, 8, 6871);
    			attr_dev(p0, "class", "svelte-1jmbafy");
    			add_location(p0, file, 345, 6, 6819);
    			add_location(br1, file, 352, 8, 7025);
    			add_location(br2, file, 355, 8, 7145);
    			add_location(br3, file, 357, 8, 7180);
    			attr_dev(p1, "class", "svelte-1jmbafy");
    			add_location(p1, file, 350, 6, 6920);
    			attr_dev(div, "class", "svelte-1jmbafy");
    			add_location(div, file, 344, 4, 6807);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(p0, br0);
    			append_dev(p0, t1);
    			append_dev(div, t2);
    			append_dev(div, p1);
    			append_dev(p1, t3);
    			append_dev(p1, t4);
    			append_dev(p1, br1);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			append_dev(p1, t7);
    			append_dev(p1, br2);
    			append_dev(p1, t8);
    			append_dev(p1, t9);
    			append_dev(p1, t10);
    			append_dev(p1, br3);
    			append_dev(p1, t11);
    			append_dev(p1, t12);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(340:2) <Saos     animation={'slide-in-fwd-tr 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}     animation_out={'scale-out-center 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both'}     top={250}     bottom={250}>",
    		ctx
    	});

    	return block;
    }

    // (364:2) <Saos     animation={'slide-in-elliptic-top-fwd 0.7s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}     animation_out={'rotate-out-center 0.6s cubic-bezier(0.550, 0.085, 0.680, 0.530) both'}     top={250}     bottom={250}>
    function create_default_slot_6(ctx) {
    	let div;
    	let p0;
    	let t0;
    	let br0;
    	let t1;
    	let t2;
    	let p1;
    	let t3_value = `animation={'slide-in-elliptic-top-fwd 0.7s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}` + "";
    	let t3;
    	let t4;
    	let br1;

    	let t5_value = `
        animation_out={'rotate-out-center 0.6s cubic-bezier(0.550, 0.085, 0.680, 0.530) both'}` + "";

    	let t5;
    	let t6;
    	let br2;
    	let t7;

    	let t8_value = `
        top={250}` + "";

    	let t8;
    	let t9;
    	let br3;
    	let t10;
    	let t11_value = `bottom={250}` + "";
    	let t11;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text("Slide in Elliptic / Rotate Out Center\n        ");
    			br0 = element("br");
    			t1 = text("\n        (250 top/bottom)");
    			t2 = space();
    			p1 = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			br1 = element("br");
    			t5 = text(t5_value);
    			t6 = space();
    			br2 = element("br");
    			t7 = space();
    			t8 = text(t8_value);
    			t9 = space();
    			br3 = element("br");
    			t10 = space();
    			t11 = text(t11_value);
    			add_location(br0, file, 371, 8, 7543);
    			attr_dev(p0, "class", "svelte-1jmbafy");
    			add_location(p0, file, 369, 6, 7485);
    			add_location(br1, file, 376, 8, 7707);
    			add_location(br2, file, 378, 8, 7819);
    			add_location(br3, file, 381, 8, 7863);
    			attr_dev(p1, "class", "svelte-1jmbafy");
    			add_location(p1, file, 374, 6, 7592);
    			attr_dev(div, "class", "svelte-1jmbafy");
    			add_location(div, file, 368, 4, 7473);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(p0, br0);
    			append_dev(p0, t1);
    			append_dev(div, t2);
    			append_dev(div, p1);
    			append_dev(p1, t3);
    			append_dev(p1, t4);
    			append_dev(p1, br1);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			append_dev(p1, br2);
    			append_dev(p1, t7);
    			append_dev(p1, t8);
    			append_dev(p1, t9);
    			append_dev(p1, br3);
    			append_dev(p1, t10);
    			append_dev(p1, t11);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(364:2) <Saos     animation={'slide-in-elliptic-top-fwd 0.7s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}     animation_out={'rotate-out-center 0.6s cubic-bezier(0.550, 0.085, 0.680, 0.530) both'}     top={250}     bottom={250}>",
    		ctx
    	});

    	return block;
    }

    // (388:2) <Saos     animation={'roll-in-left 0.6s ease-out both'}     animation_out={'rotate-out-2-cw 0.6s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}     top={250}     bottom={250}>
    function create_default_slot_5(ctx) {
    	let div;
    	let p0;
    	let t0;
    	let br0;
    	let t1;
    	let t2;
    	let p1;
    	let t3_value = `animation={'roll-in-left 0.6s ease-out both'}` + "";
    	let t3;
    	let t4;
    	let br1;
    	let t5;
    	let t6_value = `animation_out={'rotate-out-2-cw 0.6s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}` + "";
    	let t6;
    	let t7;
    	let br2;
    	let t8;
    	let t9_value = `top={250}` + "";
    	let t9;
    	let t10;
    	let br3;
    	let t11;
    	let t12_value = `bottom={250}` + "";
    	let t12;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text("Roll In Left / Rotate Out\n        ");
    			br0 = element("br");
    			t1 = text("\n        (250 top/bottom)");
    			t2 = space();
    			p1 = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			br1 = element("br");
    			t5 = space();
    			t6 = text(t6_value);
    			t7 = space();
    			br2 = element("br");
    			t8 = space();
    			t9 = text(t9_value);
    			t10 = space();
    			br3 = element("br");
    			t11 = space();
    			t12 = text(t12_value);
    			add_location(br0, file, 395, 8, 8167);
    			attr_dev(p0, "class", "svelte-1jmbafy");
    			add_location(p0, file, 393, 6, 8121);
    			add_location(br1, file, 400, 8, 8286);
    			add_location(br2, file, 402, 8, 8396);
    			add_location(br3, file, 404, 8, 8431);
    			attr_dev(p1, "class", "svelte-1jmbafy");
    			add_location(p1, file, 398, 6, 8216);
    			attr_dev(div, "class", "svelte-1jmbafy");
    			add_location(div, file, 392, 4, 8109);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(p0, br0);
    			append_dev(p0, t1);
    			append_dev(div, t2);
    			append_dev(div, p1);
    			append_dev(p1, t3);
    			append_dev(p1, t4);
    			append_dev(p1, br1);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			append_dev(p1, t7);
    			append_dev(p1, br2);
    			append_dev(p1, t8);
    			append_dev(p1, t9);
    			append_dev(p1, t10);
    			append_dev(p1, br3);
    			append_dev(p1, t11);
    			append_dev(p1, t12);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(388:2) <Saos     animation={'roll-in-left 0.6s ease-out both'}     animation_out={'rotate-out-2-cw 0.6s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}     top={250}     bottom={250}>",
    		ctx
    	});

    	return block;
    }

    // (411:2) <Saos     animation={'roll-in-blurred-left 0.65s cubic-bezier(0.230, 1.000, 0.320, 1.000) both'}     animation_out={'swirl-out-bck 0.6s ease-in both'}     top={250}     bottom={250}>
    function create_default_slot_4(ctx) {
    	let div;
    	let p0;
    	let t0;
    	let br0;
    	let t1;
    	let t2;
    	let p1;
    	let t3_value = `animation={'roll-in-blurred-left 0.65s cubic-bezier(0.230, 1.000, 0.320, 1.000) both'}` + "";
    	let t3;
    	let t4;
    	let br1;
    	let t5;
    	let t6_value = `animation_out={'swirl-out-bck 0.6s ease-in both'}` + "";
    	let t6;
    	let t7;
    	let br2;
    	let t8;
    	let t9_value = `top={250}` + "";
    	let t9;
    	let t10;
    	let br3;
    	let t11;
    	let t12_value = `bottom={250}` + "";
    	let t12;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text("Roll In Blurred / Swirl Out Bck\n        ");
    			br0 = element("br");
    			t1 = text("\n        (250 top/bottom)");
    			t2 = space();
    			p1 = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			br1 = element("br");
    			t5 = space();
    			t6 = text(t6_value);
    			t7 = space();
    			br2 = element("br");
    			t8 = space();
    			t9 = text(t9_value);
    			t10 = space();
    			br3 = element("br");
    			t11 = space();
    			t12 = text(t12_value);
    			add_location(br0, file, 418, 8, 8747);
    			attr_dev(p0, "class", "svelte-1jmbafy");
    			add_location(p0, file, 416, 6, 8695);
    			add_location(br1, file, 423, 8, 8907);
    			add_location(br2, file, 425, 8, 8982);
    			add_location(br3, file, 427, 8, 9017);
    			attr_dev(p1, "class", "svelte-1jmbafy");
    			add_location(p1, file, 421, 6, 8796);
    			attr_dev(div, "class", "svelte-1jmbafy");
    			add_location(div, file, 415, 4, 8683);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(p0, br0);
    			append_dev(p0, t1);
    			append_dev(div, t2);
    			append_dev(div, p1);
    			append_dev(p1, t3);
    			append_dev(p1, t4);
    			append_dev(p1, br1);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			append_dev(p1, t7);
    			append_dev(p1, br2);
    			append_dev(p1, t8);
    			append_dev(p1, t9);
    			append_dev(p1, t10);
    			append_dev(p1, br3);
    			append_dev(p1, t11);
    			append_dev(p1, t12);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(411:2) <Saos     animation={'roll-in-blurred-left 0.65s cubic-bezier(0.230, 1.000, 0.320, 1.000) both'}     animation_out={'swirl-out-bck 0.6s ease-in both'}     top={250}     bottom={250}>",
    		ctx
    	});

    	return block;
    }

    // (434:2) <Saos     animation={'tilt-in-fwd-tr 0.6s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}     animation_out={'flip-out-hor-top 0.45s cubic-bezier(0.550, 0.085, 0.680, 0.530) both'}     top={250}     bottom={250}>
    function create_default_slot_3(ctx) {
    	let div;
    	let p0;
    	let t0;
    	let br0;
    	let t1;
    	let t2;
    	let p1;
    	let t3_value = `animation={'tilt-in-fwd-tr 0.6s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}` + "";
    	let t3;
    	let t4;
    	let br1;
    	let t5;
    	let t6_value = `animation_out={'flip-out-hor-top 0.45s cubic-bezier(0.550, 0.085, 0.680, 0.530) both'}` + "";
    	let t6;
    	let t7;
    	let br2;
    	let t8;
    	let t9_value = `top={250}` + "";
    	let t9;
    	let t10;
    	let br3;
    	let t11;
    	let t12_value = `bottom={250}` + "";
    	let t12;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text("Tilt In Fwd / Flip Out Hor Top\n        ");
    			br0 = element("br");
    			t1 = text("\n        (250 top/bottom)");
    			t2 = space();
    			p1 = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			br1 = element("br");
    			t5 = space();
    			t6 = text(t6_value);
    			t7 = space();
    			br2 = element("br");
    			t8 = space();
    			t9 = text(t9_value);
    			t10 = space();
    			br3 = element("br");
    			t11 = space();
    			t12 = text(t12_value);
    			add_location(br0, file, 441, 8, 9362);
    			attr_dev(p0, "class", "svelte-1jmbafy");
    			add_location(p0, file, 439, 6, 9311);
    			add_location(br1, file, 446, 8, 9515);
    			add_location(br2, file, 448, 8, 9627);
    			add_location(br3, file, 450, 8, 9662);
    			attr_dev(p1, "class", "svelte-1jmbafy");
    			add_location(p1, file, 444, 6, 9411);
    			attr_dev(div, "class", "svelte-1jmbafy");
    			add_location(div, file, 438, 4, 9299);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(p0, br0);
    			append_dev(p0, t1);
    			append_dev(div, t2);
    			append_dev(div, p1);
    			append_dev(p1, t3);
    			append_dev(p1, t4);
    			append_dev(p1, br1);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			append_dev(p1, t7);
    			append_dev(p1, br2);
    			append_dev(p1, t8);
    			append_dev(p1, t9);
    			append_dev(p1, t10);
    			append_dev(p1, br3);
    			append_dev(p1, t11);
    			append_dev(p1, t12);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(434:2) <Saos     animation={'tilt-in-fwd-tr 0.6s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'}     animation_out={'flip-out-hor-top 0.45s cubic-bezier(0.550, 0.085, 0.680, 0.530) both'}     top={250}     bottom={250}>",
    		ctx
    	});

    	return block;
    }

    // (457:2) <Saos     animation={'swing-in-top-fwd 0.5s cubic-bezier(0.175, 0.885, 0.320, 1.275) both'}     animation_out={'slide-out-top 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both'}     top={250}     bottom={250}>
    function create_default_slot_2(ctx) {
    	let div;
    	let p0;
    	let t0;
    	let br0;
    	let t1;
    	let t2;
    	let p1;
    	let t3_value = `animation={'swing-in-top-fwd 0.5s cubic-bezier(0.175, 0.885, 0.320, 1.275) both'}` + "";
    	let t3;
    	let t4;
    	let br1;
    	let t5;
    	let t6_value = `animation_out={'slide-out-top 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both'}` + "";
    	let t6;
    	let t7;
    	let br2;
    	let t8;
    	let t9_value = `top={250}` + "";
    	let t9;
    	let t10;
    	let br3;
    	let t11;
    	let t12_value = `bottom={250}>` + "";
    	let t12;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text("Swing in Top / Slide Out Top\n        ");
    			br0 = element("br");
    			t1 = text("\n        (250 top/bottom)");
    			t2 = space();
    			p1 = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			br1 = element("br");
    			t5 = space();
    			t6 = text(t6_value);
    			t7 = space();
    			br2 = element("br");
    			t8 = space();
    			t9 = text(t9_value);
    			t10 = space();
    			br3 = element("br");
    			t11 = space();
    			t12 = text(t12_value);
    			add_location(br0, file, 464, 8, 10003);
    			attr_dev(p0, "class", "svelte-1jmbafy");
    			add_location(p0, file, 462, 6, 9954);
    			add_location(br1, file, 469, 8, 10158);
    			add_location(br2, file, 471, 8, 10266);
    			add_location(br3, file, 473, 8, 10301);
    			attr_dev(p1, "class", "svelte-1jmbafy");
    			add_location(p1, file, 467, 6, 10052);
    			attr_dev(div, "class", "svelte-1jmbafy");
    			add_location(div, file, 461, 4, 9942);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(p0, br0);
    			append_dev(p0, t1);
    			append_dev(div, t2);
    			append_dev(div, p1);
    			append_dev(p1, t3);
    			append_dev(p1, t4);
    			append_dev(p1, br1);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			append_dev(p1, t7);
    			append_dev(p1, br2);
    			append_dev(p1, t8);
    			append_dev(p1, t9);
    			append_dev(p1, t10);
    			append_dev(p1, br3);
    			append_dev(p1, t11);
    			append_dev(p1, t12);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(457:2) <Saos     animation={'swing-in-top-fwd 0.5s cubic-bezier(0.175, 0.885, 0.320, 1.275) both'}     animation_out={'slide-out-top 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both'}     top={250}     bottom={250}>",
    		ctx
    	});

    	return block;
    }

    // (480:2) <Saos     animation={'fade-in 1.2s cubic-bezier(0.390, 0.575, 0.565, 1.000) both'}     animation_out={'slide-out-fwd-center 0.7s cubic-bezier(0.550, 0.085, 0.680, 0.530) both'}     top={250}     bottom={250}>
    function create_default_slot_1(ctx) {
    	let div;
    	let p0;
    	let t0;
    	let br0;
    	let t1;
    	let t2;
    	let p1;
    	let t3_value = `animation={'fade-in 1.2s cubic-bezier(0.390, 0.575, 0.565, 1.000) both'}` + "";
    	let t3;
    	let t4;
    	let br1;
    	let t5;
    	let t6_value = `animation_out={'slide-out-fwd-center 0.7s cubic-bezier(0.550, 0.085, 0.680, 0.530) both'}` + "";
    	let t6;
    	let t7;
    	let br2;
    	let t8;
    	let t9_value = `top={250}` + "";
    	let t9;
    	let t10;
    	let br3;
    	let t11;
    	let t12_value = `bottom={250}` + "";
    	let t12;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text("Fade In / Slide Out\n        ");
    			br0 = element("br");
    			t1 = text("\n        (250 top/bottom)");
    			t2 = space();
    			p1 = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			br1 = element("br");
    			t5 = space();
    			t6 = text(t6_value);
    			t7 = space();
    			br2 = element("br");
    			t8 = space();
    			t9 = text(t9_value);
    			t10 = space();
    			br3 = element("br");
    			t11 = space();
    			t12 = text(t12_value);
    			add_location(br0, file, 487, 8, 10632);
    			attr_dev(p0, "class", "svelte-1jmbafy");
    			add_location(p0, file, 485, 6, 10592);
    			add_location(br1, file, 492, 8, 10778);
    			add_location(br2, file, 494, 8, 10893);
    			add_location(br3, file, 496, 8, 10928);
    			attr_dev(p1, "class", "svelte-1jmbafy");
    			add_location(p1, file, 490, 6, 10681);
    			attr_dev(div, "class", "svelte-1jmbafy");
    			add_location(div, file, 484, 4, 10580);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(p0, br0);
    			append_dev(p0, t1);
    			append_dev(div, t2);
    			append_dev(div, p1);
    			append_dev(p1, t3);
    			append_dev(p1, t4);
    			append_dev(p1, br1);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			append_dev(p1, t7);
    			append_dev(p1, br2);
    			append_dev(p1, t8);
    			append_dev(p1, t9);
    			append_dev(p1, t10);
    			append_dev(p1, br3);
    			append_dev(p1, t11);
    			append_dev(p1, t12);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(480:2) <Saos     animation={'fade-in 1.2s cubic-bezier(0.390, 0.575, 0.565, 1.000) both'}     animation_out={'slide-out-fwd-center 0.7s cubic-bezier(0.550, 0.085, 0.680, 0.530) both'}     top={250}     bottom={250}>",
    		ctx
    	});

    	return block;
    }

    // (503:2) <Saos     animation={'puff-in-center 0.7s cubic-bezier(0.470, 0.000, 0.745, 0.715) both'}     animation_out={'slide-out-elliptic-top-bck 0.7s ease-in both'}     top={250}     bottom={250}>
    function create_default_slot(ctx) {
    	let div;
    	let p0;
    	let t0;
    	let br0;
    	let t1;
    	let t2;
    	let p1;
    	let t3_value = `animation={'puff-in-center 0.7s cubic-bezier(0.470, 0.000, 0.745, 0.715) both'}` + "";
    	let t3;
    	let t4;
    	let br1;
    	let t5;
    	let t6_value = `animation_out={'slide-out-elliptic-top-bck 0.7s ease-in both'}` + "";
    	let t6;
    	let t7;
    	let br2;
    	let t8;
    	let t9_value = `top={250}` + "";
    	let t9;
    	let t10;
    	let br3;
    	let t11;
    	let t12_value = `bottom={250}` + "";
    	let t12;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text("Puff In Center / Slide Out Elliptic Top\n        ");
    			br0 = element("br");
    			t1 = text("\n        (250 top/bottom)");
    			t2 = space();
    			p1 = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			br1 = element("br");
    			t5 = space();
    			t6 = text(t6_value);
    			t7 = space();
    			br2 = element("br");
    			t8 = space();
    			t9 = text(t9_value);
    			t10 = space();
    			br3 = element("br");
    			t11 = space();
    			t12 = text(t12_value);
    			add_location(br0, file, 510, 8, 11258);
    			attr_dev(p0, "class", "svelte-1jmbafy");
    			add_location(p0, file, 508, 6, 11198);
    			add_location(br1, file, 515, 8, 11411);
    			add_location(br2, file, 517, 8, 11499);
    			add_location(br3, file, 519, 8, 11534);
    			attr_dev(p1, "class", "svelte-1jmbafy");
    			add_location(p1, file, 513, 6, 11307);
    			attr_dev(div, "class", "svelte-1jmbafy");
    			add_location(div, file, 507, 4, 11186);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(p0, br0);
    			append_dev(p0, t1);
    			append_dev(div, t2);
    			append_dev(div, p1);
    			append_dev(p1, t3);
    			append_dev(p1, t4);
    			append_dev(p1, br1);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			append_dev(p1, t7);
    			append_dev(p1, br2);
    			append_dev(p1, t8);
    			append_dev(p1, t9);
    			append_dev(p1, t10);
    			append_dev(p1, br3);
    			append_dev(p1, t11);
    			append_dev(p1, t12);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(503:2) <Saos     animation={'puff-in-center 0.7s cubic-bezier(0.470, 0.000, 0.745, 0.715) both'}     animation_out={'slide-out-elliptic-top-bck 0.7s ease-in both'}     top={250}     bottom={250}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let section;
    	let saos0;
    	let t0;
    	let saos1;
    	let t1;
    	let saos2;
    	let t2;
    	let saos3;
    	let t3;
    	let saos4;
    	let t4;
    	let saos5;
    	let t5;
    	let saos6;
    	let t6;
    	let saos7;
    	let t7;
    	let saos8;
    	let t8;
    	let saos9;
    	let t9;
    	let saos10;
    	let t10;
    	let saos11;
    	let t11;
    	let saos12;
    	let current;

    	saos0 = new Saos({
    			props: {
    				animation: "from-left 2s cubic-bezier(0.35, 0.5, 0.65, 0.95) both",
    				$$slots: { default: [create_default_slot_12] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	saos1 = new Saos({
    			props: {
    				once: true,
    				animation: "from-left 2s cubic-bezier(0.35, 0.5, 0.65, 0.95) both",
    				$$slots: { default: [create_default_slot_11] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	saos2 = new Saos({
    			props: {
    				animation: "scale-in-center 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both",
    				$$slots: { default: [create_default_slot_10] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	saos3 = new Saos({
    			props: {
    				animation: "rotate-in-center 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both",
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	saos4 = new Saos({
    			props: {
    				animation: "slide-in-top 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both",
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	saos5 = new Saos({
    			props: {
    				animation: "slide-in-fwd-tr 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both",
    				animation_out: "scale-out-center 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both",
    				top: 250,
    				bottom: 250,
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	saos6 = new Saos({
    			props: {
    				animation: "slide-in-elliptic-top-fwd 0.7s cubic-bezier(0.250, 0.460, 0.450, 0.940) both",
    				animation_out: "rotate-out-center 0.6s cubic-bezier(0.550, 0.085, 0.680, 0.530) both",
    				top: 250,
    				bottom: 250,
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	saos7 = new Saos({
    			props: {
    				animation: "roll-in-left 0.6s ease-out both",
    				animation_out: "rotate-out-2-cw 0.6s cubic-bezier(0.250, 0.460, 0.450, 0.940) both",
    				top: 250,
    				bottom: 250,
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	saos8 = new Saos({
    			props: {
    				animation: "roll-in-blurred-left 0.65s cubic-bezier(0.230, 1.000, 0.320, 1.000) both",
    				animation_out: "swirl-out-bck 0.6s ease-in both",
    				top: 250,
    				bottom: 250,
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	saos9 = new Saos({
    			props: {
    				animation: "tilt-in-fwd-tr 0.6s cubic-bezier(0.250, 0.460, 0.450, 0.940) both",
    				animation_out: "flip-out-hor-top 0.45s cubic-bezier(0.550, 0.085, 0.680, 0.530) both",
    				top: 250,
    				bottom: 250,
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	saos10 = new Saos({
    			props: {
    				animation: "swing-in-top-fwd 0.5s cubic-bezier(0.175, 0.885, 0.320, 1.275) both",
    				animation_out: "slide-out-top 0.5s cubic-bezier(0.550, 0.085, 0.680, 0.530) both",
    				top: 250,
    				bottom: 250,
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	saos11 = new Saos({
    			props: {
    				animation: "fade-in 1.2s cubic-bezier(0.390, 0.575, 0.565, 1.000) both",
    				animation_out: "slide-out-fwd-center 0.7s cubic-bezier(0.550, 0.085, 0.680, 0.530) both",
    				top: 250,
    				bottom: 250,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	saos12 = new Saos({
    			props: {
    				animation: "puff-in-center 0.7s cubic-bezier(0.470, 0.000, 0.745, 0.715) both",
    				animation_out: "slide-out-elliptic-top-bck 0.7s ease-in both",
    				top: 250,
    				bottom: 250,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(saos0.$$.fragment);
    			t0 = space();
    			create_component(saos1.$$.fragment);
    			t1 = space();
    			create_component(saos2.$$.fragment);
    			t2 = space();
    			create_component(saos3.$$.fragment);
    			t3 = space();
    			create_component(saos4.$$.fragment);
    			t4 = space();
    			create_component(saos5.$$.fragment);
    			t5 = space();
    			create_component(saos6.$$.fragment);
    			t6 = space();
    			create_component(saos7.$$.fragment);
    			t7 = space();
    			create_component(saos8.$$.fragment);
    			t8 = space();
    			create_component(saos9.$$.fragment);
    			t9 = space();
    			create_component(saos10.$$.fragment);
    			t10 = space();
    			create_component(saos11.$$.fragment);
    			t11 = space();
    			create_component(saos12.$$.fragment);
    			attr_dev(section, "class", "svelte-1jmbafy");
    			add_location(section, file, 278, 0, 5153);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(saos0, section, null);
    			append_dev(section, t0);
    			mount_component(saos1, section, null);
    			append_dev(section, t1);
    			mount_component(saos2, section, null);
    			append_dev(section, t2);
    			mount_component(saos3, section, null);
    			append_dev(section, t3);
    			mount_component(saos4, section, null);
    			append_dev(section, t4);
    			mount_component(saos5, section, null);
    			append_dev(section, t5);
    			mount_component(saos6, section, null);
    			append_dev(section, t6);
    			mount_component(saos7, section, null);
    			append_dev(section, t7);
    			mount_component(saos8, section, null);
    			append_dev(section, t8);
    			mount_component(saos9, section, null);
    			append_dev(section, t9);
    			mount_component(saos10, section, null);
    			append_dev(section, t10);
    			mount_component(saos11, section, null);
    			append_dev(section, t11);
    			mount_component(saos12, section, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const saos0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				saos0_changes.$$scope = { dirty, ctx };
    			}

    			saos0.$set(saos0_changes);
    			const saos1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				saos1_changes.$$scope = { dirty, ctx };
    			}

    			saos1.$set(saos1_changes);
    			const saos2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				saos2_changes.$$scope = { dirty, ctx };
    			}

    			saos2.$set(saos2_changes);
    			const saos3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				saos3_changes.$$scope = { dirty, ctx };
    			}

    			saos3.$set(saos3_changes);
    			const saos4_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				saos4_changes.$$scope = { dirty, ctx };
    			}

    			saos4.$set(saos4_changes);
    			const saos5_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				saos5_changes.$$scope = { dirty, ctx };
    			}

    			saos5.$set(saos5_changes);
    			const saos6_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				saos6_changes.$$scope = { dirty, ctx };
    			}

    			saos6.$set(saos6_changes);
    			const saos7_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				saos7_changes.$$scope = { dirty, ctx };
    			}

    			saos7.$set(saos7_changes);
    			const saos8_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				saos8_changes.$$scope = { dirty, ctx };
    			}

    			saos8.$set(saos8_changes);
    			const saos9_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				saos9_changes.$$scope = { dirty, ctx };
    			}

    			saos9.$set(saos9_changes);
    			const saos10_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				saos10_changes.$$scope = { dirty, ctx };
    			}

    			saos10.$set(saos10_changes);
    			const saos11_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				saos11_changes.$$scope = { dirty, ctx };
    			}

    			saos11.$set(saos11_changes);
    			const saos12_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				saos12_changes.$$scope = { dirty, ctx };
    			}

    			saos12.$set(saos12_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(saos0.$$.fragment, local);
    			transition_in(saos1.$$.fragment, local);
    			transition_in(saos2.$$.fragment, local);
    			transition_in(saos3.$$.fragment, local);
    			transition_in(saos4.$$.fragment, local);
    			transition_in(saos5.$$.fragment, local);
    			transition_in(saos6.$$.fragment, local);
    			transition_in(saos7.$$.fragment, local);
    			transition_in(saos8.$$.fragment, local);
    			transition_in(saos9.$$.fragment, local);
    			transition_in(saos10.$$.fragment, local);
    			transition_in(saos11.$$.fragment, local);
    			transition_in(saos12.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(saos0.$$.fragment, local);
    			transition_out(saos1.$$.fragment, local);
    			transition_out(saos2.$$.fragment, local);
    			transition_out(saos3.$$.fragment, local);
    			transition_out(saos4.$$.fragment, local);
    			transition_out(saos5.$$.fragment, local);
    			transition_out(saos6.$$.fragment, local);
    			transition_out(saos7.$$.fragment, local);
    			transition_out(saos8.$$.fragment, local);
    			transition_out(saos9.$$.fragment, local);
    			transition_out(saos10.$$.fragment, local);
    			transition_out(saos11.$$.fragment, local);
    			transition_out(saos12.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(saos0);
    			destroy_component(saos1);
    			destroy_component(saos2);
    			destroy_component(saos3);
    			destroy_component(saos4);
    			destroy_component(saos5);
    			destroy_component(saos6);
    			destroy_component(saos7);
    			destroy_component(saos8);
    			destroy_component(saos9);
    			destroy_component(saos10);
    			destroy_component(saos11);
    			destroy_component(saos12);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Animations> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Animations", $$slots, []);
    	$$self.$capture_state = () => ({ Saos });
    	return [];
    }

    class Animations extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Animations",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var particles_min = createCommonjsModule(function (module) {
    /*!
     * A lightweight, dependency-free and responsive javascript plugin for particle backgrounds.
     *
     * @author Marc Bruederlin <hello@marcbruederlin.com>
     * @version 2.2.3
     * @license MIT
     * @see https://github.com/marcbruederlin/particles.js
     */
    var Particles=function(e,t){var n,i={};function o(e,t){return e.x<t.x?-1:e.x>t.x?1:e.y<t.y?-1:e.y>t.y?1:0}return (n=function(){return function(){var e=this;e.defaults={responsive:null,selector:null,maxParticles:100,sizeVariations:3,showParticles:!0,speed:.5,color:"#000000",minDistance:120,connectParticles:!1},e.element=null,e.context=null,e.ratio=null,e.breakpoints=[],e.activeBreakpoint=null,e.breakpointSettings=[],e.originalSettings=null,e.storage=[],e.usingPolyfill=!1;}}()).prototype.init=function(e){var t=this;return t.options=t._extend(t.defaults,e),t.originalSettings=JSON.parse(JSON.stringify(t.options)),t._animate=t._animate.bind(t),t._initializeCanvas(),t._initializeEvents(),t._registerBreakpoints(),t._checkResponsive(),t._initializeStorage(),t._animate(),t},n.prototype.destroy=function(){var t=this;t.storage=[],t.element.remove(),e.removeEventListener("resize",t.listener,!1),e.clearTimeout(t._animation),cancelAnimationFrame(t._animation);},n.prototype._initializeCanvas=function(){var n,i,o=this;if(!o.options.selector)return console.warn("particles.js: No selector specified! Check https://github.com/marcbruederlin/particles.js#options"),!1;o.element=t.querySelector(o.options.selector),o.context=o.element.getContext("2d"),n=e.devicePixelRatio||1,i=o.context.webkitBackingStorePixelRatio||o.context.mozBackingStorePixelRatio||o.context.msBackingStorePixelRatio||o.context.oBackingStorePixelRatio||o.context.backingStorePixelRatio||1,o.ratio=n/i,o.element.width=o.element.offsetParent?o.element.offsetParent.clientWidth*o.ratio:o.element.clientWidth*o.ratio,o.element.offsetParent&&"BODY"===o.element.offsetParent.nodeName?o.element.height=e.innerHeight*o.ratio:o.element.height=o.element.offsetParent?o.element.offsetParent.clientHeight*o.ratio:o.element.clientHeight*o.ratio,o.element.style.width="100%",o.element.style.height="100%",o.context.scale(o.ratio,o.ratio);},n.prototype._initializeEvents=function(){var t=this;t.listener=function(){t._resize();}.bind(this),e.addEventListener("resize",t.listener,!1);},n.prototype._initializeStorage=function(){var e=this;e.storage=[];for(var t=e.options.maxParticles;t--;)e.storage.push(new i(e.context,e.options));},n.prototype._registerBreakpoints=function(){var e,t,n,i=this,o=i.options.responsive||null;if("object"==typeof o&&null!==o&&o.length){for(e in o)if(n=i.breakpoints.length-1,t=o[e].breakpoint,o.hasOwnProperty(e)){for(;n>=0;)i.breakpoints[n]&&i.breakpoints[n]===t&&i.breakpoints.splice(n,1),n--;i.breakpoints.push(t),i.breakpointSettings[t]=o[e].options;}i.breakpoints.sort(function(e,t){return t-e});}},n.prototype._checkResponsive=function(){var t,n=this,i=!1,o=e.innerWidth;if(n.options.responsive&&n.options.responsive.length&&null!==n.options.responsive){for(t in i=null,n.breakpoints)n.breakpoints.hasOwnProperty(t)&&o<=n.breakpoints[t]&&(i=n.breakpoints[t]);null!==i?(n.activeBreakpoint=i,n.options=n._extend(n.options,n.breakpointSettings[i])):null!==n.activeBreakpoint&&(n.activeBreakpoint=null,i=null,n.options=n._extend(n.options,n.originalSettings));}},n.prototype._refresh=function(){this._initializeStorage(),this._draw();},n.prototype._resize=function(){var t=this;t.element.width=t.element.offsetParent?t.element.offsetParent.clientWidth*t.ratio:t.element.clientWidth*t.ratio,t.element.offsetParent&&"BODY"===t.element.offsetParent.nodeName?t.element.height=e.innerHeight*t.ratio:t.element.height=t.element.offsetParent?t.element.offsetParent.clientHeight*t.ratio:t.element.clientHeight*t.ratio,t.context.scale(t.ratio,t.ratio),clearTimeout(t.windowDelay),t.windowDelay=e.setTimeout(function(){t._checkResponsive(),t._refresh();},50);},n.prototype._animate=function(){var t=this;t._draw(),t._animation=e.requestAnimFrame(t._animate);},n.prototype.resumeAnimation=function(){this._animation||this._animate();},n.prototype.pauseAnimation=function(){var t=this;if(t._animation){if(t.usingPolyfill)e.clearTimeout(t._animation);else (e.cancelAnimationFrame||e.webkitCancelAnimationFrame||e.mozCancelAnimationFrame)(t._animation);t._animation=null;}},n.prototype._draw=function(){var t=this,n=t.element,i=n.offsetParent?n.offsetParent.clientWidth:n.clientWidth,r=n.offsetParent?n.offsetParent.clientHeight:n.clientHeight,a=t.options.showParticles,s=t.storage;n.offsetParent&&"BODY"===n.offsetParent.nodeName&&(r=e.innerHeight),t.context.clearRect(0,0,n.width,n.height),t.context.beginPath();for(var l=s.length;l--;){var c=s[l];a&&c._draw(),c._updateCoordinates(i,r);}t.options.connectParticles&&(s.sort(o),t._updateEdges());},n.prototype._updateEdges=function(){for(var e=this,t=e.options.minDistance,n=Math.sqrt,i=Math.abs,o=e.storage,r=o.length,a=0;a<r;a++)for(var s=o[a],l=a+1;l<r;l++){var c,f=o[l],p=s.x-f.x,h=s.y-f.y;if(c=n(p*p+h*h),i(p)>t)break;c<=t&&e._drawEdge(s,f,1.2-c/t);}},n.prototype._drawEdge=function(e,t,n){var i=this,o=i.context.createLinearGradient(e.x,e.y,t.x,t.y),r=this._hex2rgb(e.color),a=this._hex2rgb(t.color);o.addColorStop(0,"rgba("+r.r+","+r.g+","+r.b+","+n+")"),o.addColorStop(1,"rgba("+a.r+","+a.g+","+a.b+","+n+")"),i.context.beginPath(),i.context.strokeStyle=o,i.context.moveTo(e.x,e.y),i.context.lineTo(t.x,t.y),i.context.stroke(),i.context.fill(),i.context.closePath();},n.prototype._extend=function(e,t){return Object.keys(t).forEach(function(n){e[n]=t[n];}),e},n.prototype._hex2rgb=function(e){var t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return t?{r:parseInt(t[1],16),g:parseInt(t[2],16),b:parseInt(t[3],16)}:null},(i=function(n,i){var o=this,r=Math.random,a=i.speed,s=i.color instanceof Array?i.color[Math.floor(Math.random()*i.color.length)]:i.color;o.context=n,o.options=i;var l=t.querySelector(i.selector);o.x=l.offsetParent?r()*l.offsetParent.clientWidth:r()*l.clientWidth,l.offsetParent&&"BODY"===l.offsetParent.nodeName?o.y=r()*e.innerHeight:o.y=l.offsetParent?r()*l.offsetParent.clientHeight:r()*l.clientHeight,o.vx=r()*a*2-a,o.vy=r()*a*2-a,o.radius=r()*r()*i.sizeVariations,o.color=s,o._draw();}).prototype._draw=function(){var e=this;e.context.save(),e.context.translate(e.x,e.y),e.context.moveTo(0,0),e.context.beginPath(),e.context.arc(0,0,e.radius,0,2*Math.PI,!1),e.context.fillStyle=e.color,e.context.fill(),e.context.restore();},i.prototype._updateCoordinates=function(e,t){var n=this,i=n.x+this.vx,o=n.y+this.vy,r=n.radius;i+r>e?i=r:i-r<0&&(i=e-r),o+r>t?o=r:o-r<0&&(o=t-r),n.x=i,n.y=o;},e.requestAnimFrame=function(){var t=e.requestAnimationFrame||e.webkitRequestAnimationFrame||e.mozRequestAnimationFrame;return t||(this._usingPolyfill=!0,function(t){return e.setTimeout(t,1e3/60)})}(),new n}(window,document);!function(){module.exports?module.exports=Particles:window.Particles=Particles;}();
    });

    /* src/App.svelte generated by Svelte v3.24.0 */
    const file$1 = "src/App.svelte";

    function create_fragment$1(ctx) {
    	let aside;
    	let a0;
    	let t1;
    	let main;
    	let canvas;
    	let t2;
    	let h1;
    	let t4;
    	let h2;
    	let t6;
    	let animations;
    	let t7;
    	let footer;
    	let section0;
    	let h30;
    	let t9;
    	let a1;
    	let t11;
    	let a2;
    	let t13;
    	let section1;
    	let h31;
    	let t15;
    	let p0;
    	let t17;
    	let p1;
    	let t19;
    	let section2;
    	let h32;
    	let t21;
    	let p2;
    	let t22;
    	let a3;
    	let t24;
    	let p3;
    	let t26;
    	let code0;
    	let t28;
    	let p4;
    	let t30;
    	let code1;
    	let t32;
    	let code2;
    	let t34;
    	let code3;
    	let t36;
    	let p5;
    	let t37;
    	let a4;
    	let t39;
    	let current;
    	animations = new Animations({ $$inline: true });

    	const block = {
    		c: function create() {
    			aside = element("aside");
    			a0 = element("a");
    			a0.textContent = "Star";
    			t1 = space();
    			main = element("main");
    			canvas = element("canvas");
    			t2 = space();
    			h1 = element("h1");
    			h1.textContent = "SAoS";
    			t4 = space();
    			h2 = element("h2");
    			h2.textContent = "Svelte Animation on Scroll";
    			t6 = space();
    			create_component(animations.$$.fragment);
    			t7 = space();
    			footer = element("footer");
    			section0 = element("section");
    			h30 = element("h3");
    			h30.textContent = "SAoS";
    			t9 = space();
    			a1 = element("a");
    			a1.textContent = "Github";
    			t11 = space();
    			a2 = element("a");
    			a2.textContent = "Download";
    			t13 = space();
    			section1 = element("section");
    			h31 = element("h3");
    			h31.textContent = "Install via Yarn, Npm";
    			t15 = space();
    			p0 = element("p");
    			p0.textContent = "yarn add saos";
    			t17 = space();
    			p1 = element("p");
    			p1.textContent = "npm i saos --save";
    			t19 = space();
    			section2 = element("section");
    			h32 = element("h3");
    			h32.textContent = "How to use";
    			t21 = space();
    			p2 = element("p");
    			t22 = text("Make your animation or (if you are lazy like me) get it from:\n        ");
    			a3 = element("a");
    			a3.textContent = "animista";
    			t24 = space();
    			p3 = element("p");
    			p3.textContent = "Add the -global- before the name, like:";
    			t26 = space();
    			code0 = element("code");
    			code0.textContent = `${"@keyframes -global-slide-out-fwd-center {"}`;
    			t28 = space();
    			p4 = element("p");
    			p4.textContent = "And use it with Saos, like:";
    			t30 = space();
    			code1 = element("code");
    			code1.textContent = `${`<Saos animation={'from-left 2s cubic-bezier(0.35, 0.5, 0.65, 0.95) both'}>`}`;
    			t32 = space();
    			code2 = element("code");
    			code2.textContent = `${`>>Your code here<<`}`;
    			t34 = space();
    			code3 = element("code");
    			code3.textContent = `${`</Saos>`}`;
    			t36 = space();
    			p5 = element("p");
    			t37 = text("See the\n        ");
    			a4 = element("a");
    			a4.textContent = "README";
    			t39 = text("\n        for more examples");
    			attr_dev(a0, "class", "github-button");
    			attr_dev(a0, "href", "https://github.com/shiryel/saos");
    			attr_dev(a0, "data-icon", "octicon-star");
    			attr_dev(a0, "data-size", "large");
    			attr_dev(a0, "aria-label", "Star shiryel/saos on GitHub");
    			add_location(a0, file$1, 121, 0, 1991);
    			attr_dev(aside, "class", "svelte-6pwgsk");
    			add_location(aside, file$1, 120, 0, 1983);
    			attr_dev(canvas, "class", "particles svelte-6pwgsk");
    			add_location(canvas, file$1, 124, 2, 2166);
    			attr_dev(h1, "class", "svelte-6pwgsk");
    			add_location(h1, file$1, 125, 2, 2197);
    			attr_dev(h2, "class", "svelte-6pwgsk");
    			add_location(h2, file$1, 126, 2, 2213);
    			attr_dev(h30, "class", "svelte-6pwgsk");
    			add_location(h30, file$1, 130, 6, 2297);
    			attr_dev(a1, "class", "github-button");
    			attr_dev(a1, "href", "https://github.com/shiryel/saos");
    			attr_dev(a1, "data-color-scheme", "no-preference: dark; light: dark; dark: dark;");
    			attr_dev(a1, "data-size", "large");
    			attr_dev(a1, "aria-label", "Star shiryel/saos on GitHub");
    			add_location(a1, file$1, 131, 6, 2317);
    			attr_dev(a2, "class", "github-button");
    			attr_dev(a2, "href", "https://github.com/shiryel/saos/archive/master.zip");
    			attr_dev(a2, "data-color-scheme", "no-preference: dark; light: dark; dark: dark;");
    			attr_dev(a2, "data-icon", "octicon-download");
    			attr_dev(a2, "data-size", "large");
    			attr_dev(a2, "aria-label", "Download shiryel/saos on GitHub");
    			add_location(a2, file$1, 132, 6, 2523);
    			attr_dev(section0, "class", "svelte-6pwgsk");
    			add_location(section0, file$1, 129, 4, 2281);
    			attr_dev(h31, "class", "svelte-6pwgsk");
    			add_location(h31, file$1, 136, 6, 2813);
    			attr_dev(p0, "class", "svelte-6pwgsk");
    			add_location(p0, file$1, 137, 6, 2850);
    			attr_dev(p1, "class", "svelte-6pwgsk");
    			add_location(p1, file$1, 138, 6, 2877);
    			attr_dev(section1, "class", "svelte-6pwgsk");
    			add_location(section1, file$1, 135, 4, 2797);
    			attr_dev(h32, "class", "svelte-6pwgsk");
    			add_location(h32, file$1, 142, 6, 2938);
    			attr_dev(a3, "href", "https://animista.net/");
    			attr_dev(a3, "target", "_blank");
    			add_location(a3, file$1, 145, 8, 3046);
    			attr_dev(p2, "class", "svelte-6pwgsk");
    			add_location(p2, file$1, 143, 6, 2964);
    			attr_dev(p3, "class", "svelte-6pwgsk");
    			add_location(p3, file$1, 147, 6, 3124);
    			attr_dev(code0, "class", "svelte-6pwgsk");
    			add_location(code0, file$1, 148, 6, 3177);
    			attr_dev(p4, "class", "svelte-6pwgsk");
    			add_location(p4, file$1, 149, 6, 3242);
    			attr_dev(code1, "class", "svelte-6pwgsk");
    			add_location(code1, file$1, 150, 6, 3283);
    			attr_dev(code2, "class", "svelte-6pwgsk");
    			add_location(code2, file$1, 153, 6, 3397);
    			attr_dev(code3, "class", "svelte-6pwgsk");
    			add_location(code3, file$1, 154, 6, 3439);
    			attr_dev(a4, "href", "https://github.com/shiryel/saos");
    			attr_dev(a4, "target", "_blank");
    			add_location(a4, file$1, 157, 8, 3498);
    			attr_dev(p5, "class", "svelte-6pwgsk");
    			add_location(p5, file$1, 155, 6, 3470);
    			attr_dev(section2, "class", "svelte-6pwgsk");
    			add_location(section2, file$1, 141, 4, 2922);
    			attr_dev(footer, "class", "svelte-6pwgsk");
    			add_location(footer, file$1, 128, 2, 2268);
    			attr_dev(main, "class", "svelte-6pwgsk");
    			add_location(main, file$1, 123, 0, 2157);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, aside, anchor);
    			append_dev(aside, a0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, canvas);
    			append_dev(main, t2);
    			append_dev(main, h1);
    			append_dev(main, t4);
    			append_dev(main, h2);
    			append_dev(main, t6);
    			mount_component(animations, main, null);
    			append_dev(main, t7);
    			append_dev(main, footer);
    			append_dev(footer, section0);
    			append_dev(section0, h30);
    			append_dev(section0, t9);
    			append_dev(section0, a1);
    			append_dev(section0, t11);
    			append_dev(section0, a2);
    			append_dev(footer, t13);
    			append_dev(footer, section1);
    			append_dev(section1, h31);
    			append_dev(section1, t15);
    			append_dev(section1, p0);
    			append_dev(section1, t17);
    			append_dev(section1, p1);
    			append_dev(footer, t19);
    			append_dev(footer, section2);
    			append_dev(section2, h32);
    			append_dev(section2, t21);
    			append_dev(section2, p2);
    			append_dev(p2, t22);
    			append_dev(p2, a3);
    			append_dev(section2, t24);
    			append_dev(section2, p3);
    			append_dev(section2, t26);
    			append_dev(section2, code0);
    			append_dev(section2, t28);
    			append_dev(section2, p4);
    			append_dev(section2, t30);
    			append_dev(section2, code1);
    			append_dev(section2, t32);
    			append_dev(section2, code2);
    			append_dev(section2, t34);
    			append_dev(section2, code3);
    			append_dev(section2, t36);
    			append_dev(section2, p5);
    			append_dev(p5, t37);
    			append_dev(p5, a4);
    			append_dev(p5, t39);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(animations.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(animations.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(aside);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(main);
    			destroy_component(animations);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	onMount(() => {
    		particles_min.init({
    			selector: ".particles",
    			color: ["#DA0463", "#404B69", "#DBEDF3"],
    			connectParticles: true,
    			maxParticles: 100,
    			responsive: [
    				{
    					breakpoint: 768,
    					options: {
    						maxParticles: 50,
    						color: "#48F2E3",
    						connectParticles: false
    					}
    				},
    				{
    					breakpoint: 425,
    					options: { maxParticles: 25, connectParticles: true }
    				},
    				{
    					breakpoint: 320,
    					options: { maxParticles: 10, connectParticles: true }
    				}
    			]
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ Animations, Particles: particles_min, onMount });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
