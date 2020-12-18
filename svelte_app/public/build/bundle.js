
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
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
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
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
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
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
    function tick() {
        schedule_update();
        return resolved_promise;
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
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
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
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.1' }, detail)));
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
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
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

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function regexparam (str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules\svelte-spa-router\Router.svelte generated by Svelte v3.24.1 */

    const { Error: Error_1, Object: Object_1, console: console_1 } = globals;

    // (209:0) {:else}
    function create_else_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(209:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (202:0) {#if componentParams}
    function create_if_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(202:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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

    function wrap$1(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn("Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading");

    	return wrap({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	// Check if there's a querystring
    	const qsPosition = location.indexOf("?");

    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    const location$1 = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == "#" ? "" : "#") + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == "#" ? "" : "#") + location;

    	try {
    		window.history.replaceState(undefined, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn("Caught exception while replacing the current page. If you're running this in the Svelte REPL, please note that the `replace` method might not work in this environment.");
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event("hashchange"));
    }

    function link(node, hrefVar) {
    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != "a") {
    		throw Error("Action \"link\" can only be used with <a> tags");
    	}

    	updateLink(node, hrefVar || node.getAttribute("href"));

    	return {
    		update(updated) {
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, href) {
    	// Destination must start with '/'
    	if (!href || href.length < 1 || href.charAt(0) != "/") {
    		throw Error("Invalid value for \"href\" attribute: " + href);
    	}

    	// Add # to the href attribute
    	node.setAttribute("href", "#" + href);

    	node.addEventListener("click", scrollstateHistoryHandler);
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {HTMLElementEventMap} event - an onclick event attached to an anchor tag
     */
    function scrollstateHistoryHandler(event) {
    	// Prevent default anchor onclick behaviour
    	event.preventDefault();

    	const href = event.currentTarget.getAttribute("href");

    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { routes = {} } = $$props;
    	let { prefix = "" } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != "function" && (typeof component != "object" || component._sveltesparouter !== true)) {
    				throw Error("Invalid component object");
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == "string" && (path.length < 1 || path.charAt(0) != "/" && path.charAt(0) != "*") || typeof path == "object" && !(path instanceof RegExp)) {
    				throw Error("Invalid value for \"path\" argument");
    			}

    			const { pattern, keys } = regexparam(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == "object" && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, remove it before we run the matching
    			if (prefix) {
    				if (typeof prefix == "string" && path.startsWith(prefix)) {
    					path = path.substr(prefix.length) || "/";
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || "/";
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || "") || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {bool} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	if (restoreScrollState) {
    		window.addEventListener("popstate", event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		});

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.scrollX, previousScrollState.scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick("conditionsFailed", detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoading", Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick("routeLoaded", Object.assign({}, detail, { component, name: component.name }));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == "object" && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoaded", Object.assign({}, detail, { component, name: component.name }));

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    	});

    	const writable_props = ["routes", "prefix", "restoreScrollState"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Router", $$slots, []);

    	function routeEvent_handler(event) {
    		bubble($$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		derived,
    		tick,
    		_wrap: wrap,
    		wrap: wrap$1,
    		getLocation,
    		loc,
    		location: location$1,
    		querystring,
    		push,
    		pop,
    		replace,
    		link,
    		updateLink,
    		scrollstateHistoryHandler,
    		createEventDispatcher,
    		afterUpdate,
    		regexparam,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		lastLoc,
    		componentObj
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ("component" in $$props) $$invalidate(0, component = $$props.component);
    		if ("componentParams" in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ("props" in $$props) $$invalidate(2, props = $$props.props);
    		if ("previousScrollState" in $$props) previousScrollState = $$props.previousScrollState;
    		if ("lastLoc" in $$props) lastLoc = $$props.lastLoc;
    		if ("componentObj" in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			 history.scrollRestoration = restoreScrollState ? "manual" : "auto";
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Jugadores.svelte generated by Svelte v3.24.1 */

    const { console: console_1$1 } = globals;
    const file = "src\\Jugadores.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (56:12) {#each dataJugadores as row}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*row*/ ctx[3].id_servidor + "";
    	let t0;
    	let t1;
    	let td1;
    	let a0;
    	let t2_value = /*row*/ ctx[3].nombre_jugador + "";
    	let t2;
    	let a0_href_value;
    	let t3;
    	let td2;
    	let a1;
    	let i;
    	let a1_href_value;
    	let t5;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			a0 = element("a");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			a1 = element("a");
    			i = element("i");
    			i.textContent = "edit";
    			t5 = space();
    			attr_dev(td0, "class", "blue-text");
    			add_location(td0, file, 57, 16, 1884);
    			attr_dev(a0, "href", a0_href_value = "/#/PerfilJugador/" + /*row*/ ctx[3].id_servidor + "*" + /*row*/ ctx[3].nombre_jugador);
    			add_location(a0, file, 58, 20, 1950);
    			add_location(td1, file, 58, 16, 1946);
    			attr_dev(i, "class", "material-icons left blue-text");
    			add_location(i, file, 59, 64, 2180);
    			attr_dev(a1, "href", a1_href_value = "/#/EditarJugador/" + /*row*/ ctx[3].id_jugador);
    			add_location(a1, file, 59, 20, 2136);
    			add_location(td2, file, 59, 16, 2132);
    			add_location(tr, file, 56, 14, 1862);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, a0);
    			append_dev(a0, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, a1);
    			append_dev(a1, i);
    			append_dev(tr, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dataJugadores*/ 1 && t0_value !== (t0_value = /*row*/ ctx[3].id_servidor + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*dataJugadores*/ 1 && t2_value !== (t2_value = /*row*/ ctx[3].nombre_jugador + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*dataJugadores*/ 1 && a0_href_value !== (a0_href_value = "/#/PerfilJugador/" + /*row*/ ctx[3].id_servidor + "*" + /*row*/ ctx[3].nombre_jugador)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (dirty & /*dataJugadores*/ 1 && a1_href_value !== (a1_href_value = "/#/EditarJugador/" + /*row*/ ctx[3].id_jugador)) {
    				attr_dev(a1, "href", a1_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(56:12) {#each dataJugadores as row}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main;
    	let body;
    	let div;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t4;
    	let tbody;
    	let t5;
    	let a;
    	let i;
    	let mounted;
    	let dispose;
    	let each_value = /*dataJugadores*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			body = element("body");
    			div = element("div");
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Servidor";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Jugador";
    			t3 = space();
    			th2 = element("th");
    			t4 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			a = element("a");
    			i = element("i");
    			i.textContent = "add";
    			add_location(th0, file, 49, 14, 1506);
    			add_location(th1, file, 50, 14, 1632);
    			add_location(th2, file, 51, 14, 1698);
    			add_location(tr, file, 48, 12, 1486);
    			attr_dev(thead, "class", "blue darken-1 white-text");
    			add_location(thead, file, 47, 10, 1432);
    			set_style(tbody, "background", "rgba(0,0,0,0.5)");
    			add_location(tbody, file, 54, 10, 1758);
    			attr_dev(table, "class", "highlight centered ");
    			add_location(table, file, 46, 8, 1385);
    			attr_dev(i, "class", "material-icons left");
    			add_location(i, file, 64, 99, 2426);
    			attr_dev(a, "href", "/#/NuevoJugador");
    			attr_dev(a, "class", "btn-floating btn-large waves-effect waves- blue darken-1");
    			add_location(a, file, 64, 8, 2335);
    			attr_dev(div, "class", "container");
    			set_style(div, "padding-top", "7%");
    			add_location(div, file, 45, 6, 1327);
    			set_style(body, "background-image", "url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)");
    			add_location(body, file, 44, 2, 1189);
    			add_location(main, file, 43, 0, 1179);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, body);
    			append_dev(body, div);
    			append_dev(div, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(table, t4);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(div, t5);
    			append_dev(div, a);
    			append_dev(a, i);

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						th0,
    						"click",
    						function () {
    							if (is_function(/*sort*/ ctx[1]("id_servidor"))) /*sort*/ ctx[1]("id_servidor").apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						th1,
    						"click",
    						function () {
    							if (is_function(/*sort*/ ctx[1]("nombre_jugador"))) /*sort*/ ctx[1]("nombre_jugador").apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*dataJugadores*/ 1) {
    				each_value = /*dataJugadores*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
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

    const apiURLGetJugadores = "http://127.0.0.1:5000/get_jugadores";

    function instance$1($$self, $$props, $$invalidate) {
    	let dataJugadores = []; // estructura que va a almacenar el json de la respuesta de la api

    	//onMount ejecuta la funcion al principio 
    	onMount(async function () {
    		const response = await fetch(apiURLGetJugadores);
    		$$invalidate(0, dataJugadores = await response.json());
    		console.log(dataJugadores);
    	});

    	let sortBy = { col: "id_jugador", ascending: true };
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Jugadores> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Jugadores", $$slots, []);

    	$$self.$capture_state = () => ({
    		onMount,
    		apiURLGetJugadores,
    		dataJugadores,
    		sortBy,
    		sort
    	});

    	$$self.$inject_state = $$props => {
    		if ("dataJugadores" in $$props) $$invalidate(0, dataJugadores = $$props.dataJugadores);
    		if ("sortBy" in $$props) $$invalidate(2, sortBy = $$props.sortBy);
    		if ("sort" in $$props) $$invalidate(1, sort = $$props.sort);
    	};

    	let sort;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*sortBy, dataJugadores*/ 5) {
    			 $$invalidate(1, sort = column => {
    				if (sortBy.col == column) {
    					$$invalidate(2, sortBy.ascending = !sortBy.ascending, sortBy);
    				} else {
    					$$invalidate(2, sortBy.col = column, sortBy);
    					$$invalidate(2, sortBy.ascending = true, sortBy);
    				}

    				// Modifier to sorting function for ascending or descending
    				let sortModifier = sortBy.ascending ? 1 : -1;

    				let sort = (a, b) => a[column] < b[column]
    				? -1 * sortModifier
    				: a[column] > b[column] ? 1 * sortModifier : 0;

    				$$invalidate(0, dataJugadores = dataJugadores.sort(sort));
    			});
    		}
    	};

    	return [dataJugadores, sort];
    }

    class Jugadores extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Jugadores",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\Torneos.svelte generated by Svelte v3.24.1 */
    const file$1 = "src\\Torneos.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (46:8) {#each dataTorneo as row}
    function create_each_block$1(ctx) {
    	let tr;
    	let td0;
    	let a0;
    	let t0_value = /*row*/ ctx[3].nombre_torneo + "";
    	let t0;
    	let a0_href_value;
    	let t1;
    	let td1;
    	let a1;
    	let i;
    	let a1_href_value;
    	let t3;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			a0 = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			a1 = element("a");
    			i = element("i");
    			i.textContent = "edit";
    			t3 = space();
    			attr_dev(a0, "href", a0_href_value = "/#/PerfilTorneo/" + /*row*/ ctx[3].id_torneo);
    			add_location(a0, file$1, 47, 17, 1551);
    			add_location(td0, file$1, 47, 12, 1546);
    			attr_dev(i, "class", "material-icons left blue-text");
    			add_location(i, file$1, 48, 58, 1681);
    			attr_dev(a1, "href", a1_href_value = "/#/EditarTorneo/" + /*row*/ ctx[3].id_torneo);
    			add_location(a1, file$1, 48, 16, 1639);
    			add_location(td1, file$1, 48, 12, 1635);
    			add_location(tr, file$1, 46, 10, 1528);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, a0);
    			append_dev(a0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, a1);
    			append_dev(a1, i);
    			append_dev(tr, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dataTorneo*/ 1 && t0_value !== (t0_value = /*row*/ ctx[3].nombre_torneo + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*dataTorneo*/ 1 && a0_href_value !== (a0_href_value = "/#/PerfilTorneo/" + /*row*/ ctx[3].id_torneo)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (dirty & /*dataTorneo*/ 1 && a1_href_value !== (a1_href_value = "/#/EditarTorneo/" + /*row*/ ctx[3].id_torneo)) {
    				attr_dev(a1, "href", a1_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(46:8) {#each dataTorneo as row}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let body;
    	let div;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t2;
    	let tbody;
    	let t3;
    	let a;
    	let i;
    	let mounted;
    	let dispose;
    	let each_value = /*dataTorneo*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			body = element("body");
    			div = element("div");
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Torneo";
    			t1 = space();
    			th1 = element("th");
    			t2 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			a = element("a");
    			i = element("i");
    			i.textContent = "add";
    			add_location(th0, file$1, 40, 10, 1327);
    			add_location(th1, file$1, 41, 10, 1387);
    			add_location(tr, file$1, 39, 8, 1311);
    			attr_dev(thead, "class", "blue darken-1 white-text");
    			add_location(thead, file$1, 38, 6, 1261);
    			set_style(tbody, "background", "rgba(0,0,0,0.5)");
    			add_location(tbody, file$1, 44, 6, 1435);
    			attr_dev(table, "class", "highlight centered");
    			add_location(table, file$1, 37, 4, 1219);
    			attr_dev(i, "class", "material-icons left");
    			add_location(i, file$1, 53, 94, 1899);
    			attr_dev(a, "href", "/#/NuevoTorneo");
    			attr_dev(a, "class", "btn-floating btn-large waves-effect waves- blue darken-1");
    			add_location(a, file$1, 53, 4, 1809);
    			attr_dev(div, "class", "container");
    			set_style(div, "padding-top", "7%");
    			add_location(div, file$1, 36, 2, 1165);
    			set_style(body, "background-image", "url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)");
    			add_location(body, file$1, 35, 0, 1031);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div);
    			append_dev(div, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(table, t2);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(div, t3);
    			append_dev(div, a);
    			append_dev(a, i);

    			if (!mounted) {
    				dispose = listen_dev(
    					th0,
    					"click",
    					function () {
    						if (is_function(/*sort*/ ctx[1]("nombre_torneo"))) /*sort*/ ctx[1]("nombre_torneo").apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*dataTorneo*/ 1) {
    				each_value = /*dataTorneo*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const apiURLGetTorneos = "http://127.0.0.1:5000/get_torneos";

    function instance$2($$self, $$props, $$invalidate) {
    	let dataTorneo = [];

    	onMount(async function () {
    		const response = await fetch(apiURLGetTorneos);
    		$$invalidate(0, dataTorneo = await response.json());
    	}); //console.log(data)

    	let sortBy = { col: "id_torneo", ascending: true };
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Torneos> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Torneos", $$slots, []);

    	$$self.$capture_state = () => ({
    		onMount,
    		apiURLGetTorneos,
    		dataTorneo,
    		sortBy,
    		sort
    	});

    	$$self.$inject_state = $$props => {
    		if ("dataTorneo" in $$props) $$invalidate(0, dataTorneo = $$props.dataTorneo);
    		if ("sortBy" in $$props) $$invalidate(2, sortBy = $$props.sortBy);
    		if ("sort" in $$props) $$invalidate(1, sort = $$props.sort);
    	};

    	let sort;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*sortBy, dataTorneo*/ 5) {
    			 $$invalidate(1, sort = column => {
    				if (sortBy.col == column) {
    					$$invalidate(2, sortBy.ascending = !sortBy.ascending, sortBy);
    				} else {
    					$$invalidate(2, sortBy.col = column, sortBy);
    					$$invalidate(2, sortBy.ascending = true, sortBy);
    				}

    				// Modifier to sorting function for ascending or descending
    				let sortModifier = sortBy.ascending ? 1 : -1;

    				let sort = (a, b) => a[column] < b[column]
    				? -1 * sortModifier
    				: a[column] > b[column] ? 1 * sortModifier : 0;

    				$$invalidate(0, dataTorneo = dataTorneo.sort(sort));
    			});
    		}
    	};

    	return [dataTorneo, sort];
    }

    class Torneos extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Torneos",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\Partidas.svelte generated by Svelte v3.24.1 */
    const file$2 = "src\\Partidas.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (53:10) {#each dataPartidas as row}
    function create_each_block$2(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*row*/ ctx[4].id_partida + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*row*/ ctx[4].resultado_partida + "";
    	let t2;
    	let t3;
    	let td2;
    	let a;
    	let i;
    	let a_href_value;
    	let t5;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			a = element("a");
    			i = element("i");
    			i.textContent = "edit";
    			t5 = space();
    			add_location(td0, file$2, 54, 14, 1861);
    			add_location(td1, file$2, 55, 14, 1902);
    			attr_dev(i, "class", "material-icons left blue-text");
    			add_location(i, file$2, 56, 62, 1998);
    			attr_dev(a, "href", a_href_value = "/#/EditarPartida/" + /*row*/ ctx[4].id_partida);
    			add_location(a, file$2, 56, 18, 1954);
    			add_location(td2, file$2, 56, 14, 1950);
    			add_location(tr, file$2, 53, 12, 1841);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, a);
    			append_dev(a, i);
    			append_dev(tr, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dataPartidas*/ 1 && t0_value !== (t0_value = /*row*/ ctx[4].id_partida + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*dataPartidas*/ 1 && t2_value !== (t2_value = /*row*/ ctx[4].resultado_partida + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*dataPartidas*/ 1 && a_href_value !== (a_href_value = "/#/EditarPartida/" + /*row*/ ctx[4].id_partida)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(53:10) {#each dataPartidas as row}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let body;
    	let div;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t4;
    	let tbody;
    	let t5;
    	let a;
    	let i;
    	let mounted;
    	let dispose;
    	let each_value = /*dataPartidas*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			body = element("body");
    			div = element("div");
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Partida";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Resultado";
    			t3 = space();
    			th2 = element("th");
    			t4 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			a = element("a");
    			i = element("i");
    			i.textContent = "add";
    			add_location(th0, file$2, 46, 12, 1569);
    			add_location(th1, file$2, 47, 12, 1629);
    			add_location(th2, file$2, 48, 12, 1698);
    			add_location(tr, file$2, 45, 10, 1551);
    			attr_dev(thead, "class", "blue darken-1 white-text");
    			add_location(thead, file$2, 44, 8, 1499);
    			attr_dev(tbody, "class", "blue-grey lighten-4");
    			add_location(tbody, file$2, 51, 8, 1752);
    			attr_dev(i, "class", "material-icons left");
    			add_location(i, file$2, 60, 99, 2213);
    			attr_dev(a, "href", "/#/NuevaPartida");
    			attr_dev(a, "class", "btn-floating btn-large waves-effect waves- blue darken-1");
    			add_location(a, file$2, 60, 8, 2122);
    			attr_dev(table, "class", "highlight centered");
    			add_location(table, file$2, 43, 6, 1455);
    			attr_dev(div, "class", "container");
    			set_style(div, "padding-top", "7%");
    			add_location(div, file$2, 42, 4, 1399);
    			set_style(body, "background-image", "url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)");
    			add_location(body, file$2, 41, 0, 1263);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div);
    			append_dev(div, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(table, t4);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(table, t5);
    			append_dev(table, a);
    			append_dev(a, i);

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						th0,
    						"click",
    						function () {
    							if (is_function(/*sort*/ ctx[1]("id_partida"))) /*sort*/ ctx[1]("id_partida").apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						th1,
    						"click",
    						function () {
    							if (is_function(/*sort*/ ctx[1]("resultado_partida"))) /*sort*/ ctx[1]("resultado_partida").apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*dataPartidas*/ 1) {
    				each_value = /*dataPartidas*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const apiURLGetPartidas = "http://127.0.0.1:5000/get_partidas";

    function instance$3($$self, $$props, $$invalidate) {
    	let input = "";
    	let dataPartidas = []; // estructura que va a almacenar el json de la respuesta de la api

    	//onMount ejecuta la funcion al principio 
    	onMount(async function () {
    		const response = await fetch(apiURLGetPartidas);
    		$$invalidate(0, dataPartidas = await response.json());
    	}); //console.log(dataPartidas)

    	let sortBy = { col: "id_partida", ascending: true };
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Partidas> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Partidas", $$slots, []);

    	$$self.$capture_state = () => ({
    		input,
    		onMount,
    		apiURLGetPartidas,
    		dataPartidas,
    		sortBy,
    		sort
    	});

    	$$self.$inject_state = $$props => {
    		if ("input" in $$props) input = $$props.input;
    		if ("dataPartidas" in $$props) $$invalidate(0, dataPartidas = $$props.dataPartidas);
    		if ("sortBy" in $$props) $$invalidate(2, sortBy = $$props.sortBy);
    		if ("sort" in $$props) $$invalidate(1, sort = $$props.sort);
    	};

    	let sort;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*sortBy, dataPartidas*/ 5) {
    			 $$invalidate(1, sort = column => {
    				if (sortBy.col == column) {
    					$$invalidate(2, sortBy.ascending = !sortBy.ascending, sortBy);
    				} else {
    					$$invalidate(2, sortBy.col = column, sortBy);
    					$$invalidate(2, sortBy.ascending = true, sortBy);
    				}

    				// Modifier to sorting function for ascending or descending
    				let sortModifier = sortBy.ascending ? 1 : -1;

    				let sort = (a, b) => a[column] < b[column]
    				? -1 * sortModifier
    				: a[column] > b[column] ? 1 * sortModifier : 0;

    				$$invalidate(0, dataPartidas = dataPartidas.sort(sort));
    			});
    		}
    	};

    	return [dataPartidas, sort];
    }

    class Partidas extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Partidas",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\Equipos.svelte generated by Svelte v3.24.1 */
    const file$3 = "src\\Equipos.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (45:10) {#each dataEquipos as row}
    function create_each_block$3(ctx) {
    	let tr;
    	let td0;
    	let a0;
    	let t0_value = /*row*/ ctx[3].nombre_equipo + "";
    	let t0;
    	let a0_href_value;
    	let t1;
    	let td1;
    	let a1;
    	let i;
    	let a1_href_value;
    	let t3;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			a0 = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			a1 = element("a");
    			i = element("i");
    			i.textContent = "edit";
    			t3 = space();
    			attr_dev(a0, "href", a0_href_value = "/#/PerfilEquipo/" + /*row*/ ctx[3].id_equipo);
    			add_location(a0, file$3, 46, 18, 1516);
    			add_location(td0, file$3, 46, 14, 1512);
    			attr_dev(i, "class", "material-icons left blue-text");
    			add_location(i, file$3, 47, 60, 1648);
    			attr_dev(a1, "href", a1_href_value = "/#/EditarEquipo/" + /*row*/ ctx[3].id_equipo);
    			add_location(a1, file$3, 47, 18, 1606);
    			add_location(td1, file$3, 47, 14, 1602);
    			add_location(tr, file$3, 45, 12, 1492);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, a0);
    			append_dev(a0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, a1);
    			append_dev(a1, i);
    			append_dev(tr, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dataEquipos*/ 1 && t0_value !== (t0_value = /*row*/ ctx[3].nombre_equipo + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*dataEquipos*/ 1 && a0_href_value !== (a0_href_value = "/#/PerfilEquipo/" + /*row*/ ctx[3].id_equipo)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (dirty & /*dataEquipos*/ 1 && a1_href_value !== (a1_href_value = "/#/EditarEquipo/" + /*row*/ ctx[3].id_equipo)) {
    				attr_dev(a1, "href", a1_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(45:10) {#each dataEquipos as row}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let body;
    	let div;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t2;
    	let tbody;
    	let t3;
    	let a;
    	let i;
    	let mounted;
    	let dispose;
    	let each_value = /*dataEquipos*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			body = element("body");
    			div = element("div");
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Equipos";
    			t1 = space();
    			th1 = element("th");
    			t2 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			a = element("a");
    			i = element("i");
    			i.textContent = "add";
    			add_location(th0, file$3, 38, 10, 1281);
    			add_location(th1, file$3, 39, 10, 1342);
    			add_location(tr, file$3, 37, 8, 1265);
    			attr_dev(thead, "class", "blue darken-1 white-text");
    			add_location(thead, file$3, 36, 6, 1215);
    			set_style(tbody, "background", "rgba(0,0,0,0.5)");
    			add_location(tbody, file$3, 43, 8, 1394);
    			attr_dev(table, "class", "highlight centered");
    			add_location(table, file$3, 34, 4, 1171);
    			attr_dev(i, "class", "material-icons left");
    			add_location(i, file$3, 54, 94, 1896);
    			attr_dev(a, "href", "/#/NuevoEquipo");
    			attr_dev(a, "class", "btn-floating btn-large waves-effect waves- blue darken-1");
    			add_location(a, file$3, 54, 4, 1806);
    			attr_dev(div, "class", "container");
    			set_style(div, "padding-top", "7%");
    			add_location(div, file$3, 33, 2, 1117);
    			set_style(body, "background-image", "url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)");
    			add_location(body, file$3, 32, 0, 983);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div);
    			append_dev(div, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(table, t2);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(div, t3);
    			append_dev(div, a);
    			append_dev(a, i);

    			if (!mounted) {
    				dispose = listen_dev(
    					th0,
    					"click",
    					function () {
    						if (is_function(/*sort*/ ctx[1]("nombre_equipo"))) /*sort*/ ctx[1]("nombre_equipo").apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*dataEquipos*/ 1) {
    				each_value = /*dataEquipos*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const apiURLGetEquipos = "http://127.0.0.1:5000/get_equipos";

    function instance$4($$self, $$props, $$invalidate) {
    	let dataEquipos = [];

    	onMount(async function () {
    		const response = await fetch(apiURLGetEquipos);
    		$$invalidate(0, dataEquipos = await response.json());
    	}); //console.log(dataEquipos)

    	let sortBy = { col: "id_equipo", ascending: true };
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Equipos> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Equipos", $$slots, []);

    	$$self.$capture_state = () => ({
    		onMount,
    		apiURLGetEquipos,
    		dataEquipos,
    		sortBy,
    		sort
    	});

    	$$self.$inject_state = $$props => {
    		if ("dataEquipos" in $$props) $$invalidate(0, dataEquipos = $$props.dataEquipos);
    		if ("sortBy" in $$props) $$invalidate(2, sortBy = $$props.sortBy);
    		if ("sort" in $$props) $$invalidate(1, sort = $$props.sort);
    	};

    	let sort;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*sortBy, dataEquipos*/ 5) {
    			 $$invalidate(1, sort = column => {
    				if (sortBy.col == column) {
    					$$invalidate(2, sortBy.ascending = !sortBy.ascending, sortBy);
    				} else {
    					$$invalidate(2, sortBy.col = column, sortBy);
    					$$invalidate(2, sortBy.ascending = true, sortBy);
    				}

    				// Modifier to sorting function for ascending or descending
    				let sortModifier = sortBy.ascending ? 1 : -1;

    				let sort = (a, b) => a[column] < b[column]
    				? -1 * sortModifier
    				: a[column] > b[column] ? 1 * sortModifier : 0;

    				$$invalidate(0, dataEquipos = dataEquipos.sort(sort));
    			});
    		}
    	};

    	return [dataEquipos, sort];
    }

    class Equipos extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Equipos",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\EditarJugador.svelte generated by Svelte v3.24.1 */
    const file$4 = "src\\EditarJugador.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (92:18) {#each dataServidores as servidor }
    function create_each_block$4(ctx) {
    	let option;
    	let t_value = /*servidor*/ ctx[14].region_servidor + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*servidor*/ ctx[14].id_servidor;
    			option.value = option.__value;
    			add_location(option, file$4, 92, 18, 3790);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dataServidores*/ 4 && t_value !== (t_value = /*servidor*/ ctx[14].region_servidor + "")) set_data_dev(t, t_value);

    			if (dirty & /*dataServidores*/ 4 && option_value_value !== (option_value_value = /*servidor*/ ctx[14].id_servidor)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(92:18) {#each dataServidores as servidor }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let body;
    	let div9;
    	let div8;
    	let div7;
    	let div0;
    	let span;
    	let t1;
    	let div6;
    	let div2;
    	let div1;
    	let input;
    	let input_placeholder_value;
    	let t2;
    	let label0;
    	let t4;
    	let div4;
    	let div3;
    	let select;
    	let option;
    	let t5;
    	let t6;
    	let label1;
    	let t8;
    	let div5;
    	let button0;
    	let i0;
    	let t10;
    	let t11;
    	let button1;
    	let i1;
    	let t13;
    	let mounted;
    	let dispose;
    	let each_value = /*dataServidores*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			body = element("body");
    			div9 = element("div");
    			div8 = element("div");
    			div7 = element("div");
    			div0 = element("div");
    			span = element("span");
    			span.textContent = "Editar Jugador";
    			t1 = space();
    			div6 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			input = element("input");
    			t2 = space();
    			label0 = element("label");
    			label0.textContent = "Nombre Jugador";
    			t4 = space();
    			div4 = element("div");
    			div3 = element("div");
    			select = element("select");
    			option = element("option");
    			t5 = text(/*servidorActual*/ ctx[4]);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			label1 = element("label");
    			label1.textContent = "Nombre Servidor";
    			t8 = space();
    			div5 = element("div");
    			button0 = element("button");
    			i0 = element("i");
    			i0.textContent = "check_circle";
    			t10 = text("Confirmar");
    			t11 = space();
    			button1 = element("button");
    			i1 = element("i");
    			i1.textContent = "delete";
    			t13 = text("Eliminar");
    			attr_dev(span, "class", "card-title center ");
    			set_style(span, "color", "#263238 ");
    			set_style(span, "font-size", "2em");
    			set_style(span, "font-weight", "bolder");
    			add_location(span, file$4, 77, 10, 2875);
    			attr_dev(div0, "class", "card-content black-text");
    			add_location(div0, file$4, 76, 8, 2825);
    			set_style(input, "border-radius", "20px");
    			attr_dev(input, "placeholder", input_placeholder_value = /*dataJugador*/ ctx[0].nombre_jugador);
    			attr_dev(input, "id", "nombre_jugador");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "white validate black-text");
    			add_location(input, file$4, 82, 12, 3135);
    			attr_dev(label0, "class", "active ");
    			attr_dev(label0, "for", "nombre_jugador");
    			add_location(label0, file$4, 83, 14, 3325);
    			attr_dev(div1, "class", "row input-field");
    			add_location(div1, file$4, 81, 12, 3092);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file$4, 80, 10, 3054);
    			option.__value = "";
    			option.value = option.__value;
    			option.disabled = true;
    			option.selected = true;
    			add_location(option, file$4, 90, 18, 3655);
    			set_style(select, "border-radius", "20px");
    			attr_dev(select, "class", "browser-default");
    			if (/*servidorSelected*/ ctx[1] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[9].call(select));
    			add_location(select, file$4, 89, 16, 3545);
    			attr_dev(label1, "class", "active");
    			attr_dev(label1, "for", "first_name ");
    			add_location(label1, file$4, 95, 16, 3934);
    			attr_dev(div3, "class", "row input-field");
    			add_location(div3, file$4, 88, 12, 3491);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$4, 87, 10, 3454);
    			attr_dev(i0, "class", "material-icons left ");
    			add_location(i0, file$4, 100, 131, 4214);
    			attr_dev(button0, "href", "/#/Jugadores");
    			attr_dev(button0, "class", "waves-effect waves-light btn  blue darken-1");
    			add_location(button0, file$4, 100, 14, 4097);
    			attr_dev(i1, "class", "material-icons left ");
    			add_location(i1, file$4, 101, 128, 4410);
    			attr_dev(button1, "href", "/#/Jugadores");
    			attr_dev(button1, "class", "waves-effect waves-light btn blue darken-1");
    			add_location(button1, file$4, 101, 14, 4296);
    			attr_dev(div5, "class", "container");
    			add_location(div5, file$4, 99, 10, 4052);
    			attr_dev(div6, "class", "card-action");
    			add_location(div6, file$4, 79, 8, 3017);
    			attr_dev(div7, "class", "col s12 m4 l8 card blue-grey lighten-5");
    			add_location(div7, file$4, 75, 6, 2763);
    			attr_dev(div8, "class", "container");
    			add_location(div8, file$4, 74, 4, 2730);
    			attr_dev(div9, "class", "container ");
    			set_style(div9, "padding-top", "10%");
    			add_location(div9, file$4, 73, 2, 2674);
    			set_style(body, "background-image", "url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)");
    			add_location(body, file$4, 72, 0, 2539);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div9);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			append_dev(div7, div0);
    			append_dev(div0, span);
    			append_dev(div7, t1);
    			append_dev(div7, div6);
    			append_dev(div6, div2);
    			append_dev(div2, div1);
    			append_dev(div1, input);
    			set_input_value(input, /*nombreJugadorNuevo*/ ctx[3]);
    			append_dev(div1, t2);
    			append_dev(div1, label0);
    			append_dev(div6, t4);
    			append_dev(div6, div4);
    			append_dev(div4, div3);
    			append_dev(div3, select);
    			append_dev(select, option);
    			append_dev(option, t5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*servidorSelected*/ ctx[1]);
    			append_dev(div3, t6);
    			append_dev(div3, label1);
    			append_dev(div6, t8);
    			append_dev(div6, div5);
    			append_dev(div5, button0);
    			append_dev(button0, i0);
    			append_dev(button0, t10);
    			append_dev(div5, t11);
    			append_dev(div5, button1);
    			append_dev(button1, i1);
    			append_dev(button1, t13);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[8]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[9]),
    					listen_dev(button0, "click", /*click_handler*/ ctx[10], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dataJugador*/ 1 && input_placeholder_value !== (input_placeholder_value = /*dataJugador*/ ctx[0].nombre_jugador)) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty & /*nombreJugadorNuevo*/ 8 && input.value !== /*nombreJugadorNuevo*/ ctx[3]) {
    				set_input_value(input, /*nombreJugadorNuevo*/ ctx[3]);
    			}

    			if (dirty & /*servidorActual*/ 16) set_data_dev(t5, /*servidorActual*/ ctx[4]);

    			if (dirty & /*dataServidores*/ 4) {
    				each_value = /*dataServidores*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*servidorSelected, dataServidores*/ 6) {
    				select_option(select, /*servidorSelected*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const apiURLGetJugador = "http://127.0.0.1:5000/get_jugador/";
    const apiURLGetServidores = "http://127.0.0.1:5000/get_servidores";
    const apiURLUpdJugador = "http://127.0.0.1:5000/update_jugador/";
    const apiURLDelJugador = "http://127.0.0.1:5000/delete_jugador/";
    const apiURLGetServidor = "http://127.0.0.1:5000/get_servidor/";

    function instance$5($$self, $$props, $$invalidate) {
    	let { params } = $$props;
    	let dataJugador = [];
    	let servidorSelected;
    	let dataServidores = [];
    	let nombreJugadorNuevo = "";
    	let servidorActual = "";
    	let idJugador = params.ID_Jugador;

    	onMount(async function () {
    		const response = await fetch(apiURLGetJugador + idJugador);
    		let json = await response.json();
    		$$invalidate(0, dataJugador = json);
    		nombreServidor(dataJugador.id_servidor); // paso el id servidor para obtener el NOMBRE del servidor actual
    	}); //console.log(dataJugador)

    	onMount(async function () {
    		const response = await fetch(apiURLGetServidores);
    		$$invalidate(2, dataServidores = await response.json());
    	}); //console.log(dataServidores)

    	async function nombreServidor(id_servidor) {
    		const response = await fetch(apiURLGetServidor + id_servidor);
    		let dataServidor = await response.json();
    		$$invalidate(4, servidorActual = dataServidor.region_servidor);
    	}

    	async function actualizarJugador() {
    		if (nombreJugadorNuevo == "") $$invalidate(3, nombreJugadorNuevo = dataJugador.nombre_jugador); // si no actualizo el nombre, se setea el nombre anterior para no hacer un actualizar con vacion y perder el valor
    		if (servidorSelected == "") $$invalidate(1, servidorSelected = dataJugador.id_servidor); // SAME que arriba

    		const response = await fetch(apiURLUpdJugador + idJugador, {
    			method: "PUT",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				"id_jugador": null,
    				"id_servidor": servidorSelected,
    				"nombre_jugador": nombreJugadorNuevo
    			})
    		});

    		location.href = "/#/Jugadores";
    	} //const json = await response.json()
    	//let result = JSON.stringify(json)

    	//console.log(result)
    	async function eliminarJugador() {
    		const response = await fetch(apiURLDelJugador + idJugador, { method: "DELETE" });
    		location.href = "/#/Jugadores";
    	} //const json = await response.json()
    	//let result = JSON.stringify(json)

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<EditarJugador> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("EditarJugador", $$slots, []);

    	function input_input_handler() {
    		nombreJugadorNuevo = this.value;
    		$$invalidate(3, nombreJugadorNuevo);
    	}

    	function select_change_handler() {
    		servidorSelected = select_value(this);
    		$$invalidate(1, servidorSelected);
    		$$invalidate(2, dataServidores);
    	}

    	const click_handler = () => actualizarJugador();
    	const click_handler_1 = () => eliminarJugador();

    	$$self.$$set = $$props => {
    		if ("params" in $$props) $$invalidate(7, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		params,
    		apiURLGetJugador,
    		apiURLGetServidores,
    		apiURLUpdJugador,
    		apiURLDelJugador,
    		apiURLGetServidor,
    		dataJugador,
    		servidorSelected,
    		dataServidores,
    		nombreJugadorNuevo,
    		servidorActual,
    		idJugador,
    		nombreServidor,
    		actualizarJugador,
    		eliminarJugador
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(7, params = $$props.params);
    		if ("dataJugador" in $$props) $$invalidate(0, dataJugador = $$props.dataJugador);
    		if ("servidorSelected" in $$props) $$invalidate(1, servidorSelected = $$props.servidorSelected);
    		if ("dataServidores" in $$props) $$invalidate(2, dataServidores = $$props.dataServidores);
    		if ("nombreJugadorNuevo" in $$props) $$invalidate(3, nombreJugadorNuevo = $$props.nombreJugadorNuevo);
    		if ("servidorActual" in $$props) $$invalidate(4, servidorActual = $$props.servidorActual);
    		if ("idJugador" in $$props) idJugador = $$props.idJugador;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		dataJugador,
    		servidorSelected,
    		dataServidores,
    		nombreJugadorNuevo,
    		servidorActual,
    		actualizarJugador,
    		eliminarJugador,
    		params,
    		input_input_handler,
    		select_change_handler,
    		click_handler,
    		click_handler_1
    	];
    }

    class EditarJugador extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { params: 7 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditarJugador",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*params*/ ctx[7] === undefined && !("params" in props)) {
    			console.warn("<EditarJugador> was created without expected prop 'params'");
    		}
    	}

    	get params() {
    		throw new Error("<EditarJugador>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<EditarJugador>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\EditarTorneo.svelte generated by Svelte v3.24.1 */
    const file$5 = "src\\EditarTorneo.svelte";

    function create_fragment$6(ctx) {
    	let body;
    	let div7;
    	let div6;
    	let div5;
    	let div0;
    	let span;
    	let t1;
    	let div4;
    	let div2;
    	let div1;
    	let input;
    	let input_placeholder_value;
    	let t2;
    	let label;
    	let t4;
    	let div3;
    	let button0;
    	let i0;
    	let t6;
    	let t7;
    	let button1;
    	let i1;
    	let t9;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			body = element("body");
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			span = element("span");
    			span.textContent = "Editar Torneo";
    			t1 = space();
    			div4 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			input = element("input");
    			t2 = space();
    			label = element("label");
    			label.textContent = "Nombre Torneo";
    			t4 = space();
    			div3 = element("div");
    			button0 = element("button");
    			i0 = element("i");
    			i0.textContent = "check_circle";
    			t6 = text("Confirmar");
    			t7 = space();
    			button1 = element("button");
    			i1 = element("i");
    			i1.textContent = "delete";
    			t9 = text("Eliminar");
    			attr_dev(span, "class", "card-title center");
    			set_style(span, "color", "#263238 ");
    			set_style(span, "font-size", "2em");
    			set_style(span, "font-weight", "bolder");
    			add_location(span, file$5, 56, 10, 1984);
    			attr_dev(div0, "class", "card-content black-text");
    			add_location(div0, file$5, 55, 8, 1934);
    			attr_dev(input, "id", "nombre_torneo");
    			set_style(input, "border-radius", "20px");
    			attr_dev(input, "placeholder", input_placeholder_value = /*dataTorneo*/ ctx[0].nombre_torneo);
    			attr_dev(input, "class", "white validate black-text");
    			add_location(input, file$5, 62, 12, 2244);
    			attr_dev(label, "class", "active ");
    			attr_dev(label, "for", "nombre_torneo");
    			add_location(label, file$5, 63, 14, 2418);
    			attr_dev(div1, "class", "row input-field");
    			add_location(div1, file$5, 61, 12, 2201);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file$5, 60, 10, 2163);
    			attr_dev(i0, "class", "material-icons left ");
    			add_location(i0, file$5, 67, 110, 2674);
    			attr_dev(button0, "class", "waves-effect waves-light btn  blue darken-1");
    			add_location(button0, file$5, 67, 14, 2578);
    			attr_dev(i1, "class", "material-icons left ");
    			add_location(i1, file$5, 68, 108, 2850);
    			attr_dev(button1, "class", "waves-effect waves-light btn  blue darken-1");
    			add_location(button1, file$5, 68, 14, 2756);
    			attr_dev(div3, "class", "container");
    			add_location(div3, file$5, 66, 10, 2533);
    			attr_dev(div4, "class", "card-action");
    			add_location(div4, file$5, 59, 8, 2126);
    			attr_dev(div5, "class", "col s12 m4 l8 card blue-grey lighten-5");
    			add_location(div5, file$5, 54, 6, 1872);
    			attr_dev(div6, "class", "container");
    			add_location(div6, file$5, 53, 4, 1839);
    			attr_dev(div7, "class", "container ");
    			set_style(div7, "padding-top", "10%");
    			add_location(div7, file$5, 52, 2, 1783);
    			set_style(body, "background-image", "url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)");
    			add_location(body, file$5, 51, 0, 1648);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div0);
    			append_dev(div0, span);
    			append_dev(div5, t1);
    			append_dev(div5, div4);
    			append_dev(div4, div2);
    			append_dev(div2, div1);
    			append_dev(div1, input);
    			set_input_value(input, /*nombreTorneoNuevo*/ ctx[1]);
    			append_dev(div1, t2);
    			append_dev(div1, label);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div3, button0);
    			append_dev(button0, i0);
    			append_dev(button0, t6);
    			append_dev(div3, t7);
    			append_dev(div3, button1);
    			append_dev(button1, i1);
    			append_dev(button1, t9);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[5]),
    					listen_dev(button0, "click", /*click_handler*/ ctx[6], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dataTorneo*/ 1 && input_placeholder_value !== (input_placeholder_value = /*dataTorneo*/ ctx[0].nombre_torneo)) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty & /*nombreTorneoNuevo*/ 2 && input.value !== /*nombreTorneoNuevo*/ ctx[1]) {
    				set_input_value(input, /*nombreTorneoNuevo*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const apiURLGetTorneo = "http://127.0.0.1:5000/get_torneo/";
    const apiURLUpdTorneo = "http://127.0.0.1:5000/update_torneo/";
    const apiURLDelTorneo = "http://127.0.0.1:5000/delete_torneo/";

    function instance$6($$self, $$props, $$invalidate) {
    	let { params } = $$props;
    	let dataTorneo = [];
    	let nombreTorneoNuevo = "";
    	let idTorneo = params.ID_Torneo; // para las urls de la api

    	onMount(async function () {
    		const response = await fetch(apiURLGetTorneo + idTorneo);
    		let json = await response.json();
    		$$invalidate(0, dataTorneo = json);
    	}); //console.log(dataTorneo)

    	async function actualizarTorneo() {
    		if (nombreTorneoNuevo == "") $$invalidate(1, nombreTorneoNuevo = dataTorneo.nombre_torneo); // para que si es vacio no actualice again con vacio y queremos el gris 

    		const response = await fetch(apiURLUpdTorneo + idTorneo, {
    			method: "PUT",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				"id_torneo": null,
    				"nombre_torneo": nombreTorneoNuevo
    			})
    		});

    		location.href = "/#/Torneos";
    	} //const json = await response.json()
    	//let result = JSON.stringify(json)

    	//console.log(result)
    	async function eliminarTorneo() {
    		const response = await fetch(apiURLDelTorneo + idTorneo, { method: "DELETE" });
    		location.href = "/#/Torneos";
    	} //const json = await response.json()
    	//let result = JSON.stringify(json)

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<EditarTorneo> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("EditarTorneo", $$slots, []);

    	function input_input_handler() {
    		nombreTorneoNuevo = this.value;
    		$$invalidate(1, nombreTorneoNuevo);
    	}

    	const click_handler = () => actualizarTorneo();
    	const click_handler_1 = () => eliminarTorneo();

    	$$self.$$set = $$props => {
    		if ("params" in $$props) $$invalidate(4, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		params,
    		apiURLGetTorneo,
    		apiURLUpdTorneo,
    		apiURLDelTorneo,
    		dataTorneo,
    		nombreTorneoNuevo,
    		idTorneo,
    		actualizarTorneo,
    		eliminarTorneo
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(4, params = $$props.params);
    		if ("dataTorneo" in $$props) $$invalidate(0, dataTorneo = $$props.dataTorneo);
    		if ("nombreTorneoNuevo" in $$props) $$invalidate(1, nombreTorneoNuevo = $$props.nombreTorneoNuevo);
    		if ("idTorneo" in $$props) idTorneo = $$props.idTorneo;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		dataTorneo,
    		nombreTorneoNuevo,
    		actualizarTorneo,
    		eliminarTorneo,
    		params,
    		input_input_handler,
    		click_handler,
    		click_handler_1
    	];
    }

    class EditarTorneo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { params: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditarTorneo",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*params*/ ctx[4] === undefined && !("params" in props)) {
    			console.warn("<EditarTorneo> was created without expected prop 'params'");
    		}
    	}

    	get params() {
    		throw new Error("<EditarTorneo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<EditarTorneo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\EditarPartida.svelte generated by Svelte v3.24.1 */

    const { console: console_1$2 } = globals;
    const file$6 = "src\\EditarPartida.svelte";

    function create_fragment$7(ctx) {
    	let link0;
    	let link1;
    	let link2;
    	let meta;
    	let t0;
    	let body;
    	let div7;
    	let div6;
    	let div5;
    	let div0;
    	let span0;
    	let t2;
    	let span1;
    	let t3;
    	let t4_value = /*dataPartida*/ ctx[0].id_partida + "";
    	let t4;
    	let t5;
    	let div4;
    	let div2;
    	let div1;
    	let input;
    	let input_placeholder_value;
    	let t6;
    	let label;
    	let t8;
    	let div3;
    	let button;
    	let i;
    	let t10;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			link1 = element("link");
    			link2 = element("link");
    			meta = element("meta");
    			t0 = space();
    			body = element("body");
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "Editar Partida";
    			t2 = space();
    			span1 = element("span");
    			t3 = text("Editando partida #");
    			t4 = text(t4_value);
    			t5 = space();
    			div4 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			input = element("input");
    			t6 = space();
    			label = element("label");
    			label.textContent = "Resultado Partida";
    			t8 = space();
    			div3 = element("div");
    			button = element("button");
    			i = element("i");
    			i.textContent = "check_circle";
    			t10 = text("Confirmar");
    			attr_dev(link0, "href", "https://fonts.googleapis.com/icon?family=Material+Icons");
    			attr_dev(link0, "rel", "stylesheet");
    			add_location(link0, file$6, 60, 4, 1768);
    			attr_dev(link1, "type", "text/css");
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "href", "css/materialize.min.css");
    			attr_dev(link1, "media", "screen,projection");
    			add_location(link1, file$6, 62, 4, 1895);
    			attr_dev(link2, "rel", "stylesheet");
    			attr_dev(link2, "href", "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css");
    			add_location(link2, file$6, 63, 4, 1999);
    			attr_dev(meta, "name", "viewport");
    			attr_dev(meta, "content", "width=device-width, initial-scale=1.0");
    			add_location(meta, file$6, 65, 4, 2178);
    			attr_dev(span0, "class", "card-title center ");
    			set_style(span0, "color", "#263238 ");
    			set_style(span0, "font-size", "2em");
    			set_style(span0, "font-weight", "bolder");
    			add_location(span0, file$6, 73, 10, 2612);
    			attr_dev(span1, "class", "card-title center ");
    			set_style(span1, "color", "#263238 ");
    			set_style(span1, "font-size", "1em");
    			set_style(span1, "font-weight", "bolder");
    			add_location(span1, file$6, 74, 8, 2738);
    			attr_dev(div0, "class", "card-content black-text thick ");
    			add_location(div0, file$6, 72, 8, 2555);
    			set_style(input, "border-radius", "20px");
    			attr_dev(input, "placeholder", input_placeholder_value = /*dataPartida*/ ctx[0].resultado_partida);
    			attr_dev(input, "id", "first_name");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "white validate black-text");
    			add_location(input, file$6, 79, 12, 3041);
    			attr_dev(label, "class", "active ");
    			attr_dev(label, "for", "first_name ");
    			add_location(label, file$6, 80, 14, 3233);
    			attr_dev(div1, "class", "row input-field col s6 offset ");
    			add_location(div1, file$6, 78, 12, 2983);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file$6, 77, 10, 2945);
    			attr_dev(i, "class", "material-icons left ");
    			add_location(i, file$6, 84, 113, 3494);
    			attr_dev(button, "class", "waves-effect waves-light btn   blue darken-1");
    			add_location(button, file$6, 84, 14, 3395);
    			attr_dev(div3, "class", "container");
    			add_location(div3, file$6, 83, 10, 3350);
    			attr_dev(div4, "class", "card-action");
    			add_location(div4, file$6, 76, 8, 2908);
    			attr_dev(div5, "class", "col s12 m4 l8 card blue-grey lighten-5");
    			add_location(div5, file$6, 71, 6, 2493);
    			attr_dev(div6, "class", "container");
    			add_location(div6, file$6, 70, 4, 2460);
    			attr_dev(div7, "class", "container ");
    			set_style(div7, "padding-top", "10%");
    			add_location(div7, file$6, 69, 2, 2404);
    			set_style(body, "background-image", "url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)");
    			add_location(body, file$6, 68, 0, 2269);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link0);
    			append_dev(document.head, link1);
    			append_dev(document.head, link2);
    			append_dev(document.head, meta);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, body, anchor);
    			append_dev(body, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div0);
    			append_dev(div0, span0);
    			append_dev(div0, t2);
    			append_dev(div0, span1);
    			append_dev(span1, t3);
    			append_dev(span1, t4);
    			append_dev(div5, t5);
    			append_dev(div5, div4);
    			append_dev(div4, div2);
    			append_dev(div2, div1);
    			append_dev(div1, input);
    			set_input_value(input, /*resultadoPartidaNuevo*/ ctx[1]);
    			append_dev(div1, t6);
    			append_dev(div1, label);
    			append_dev(div4, t8);
    			append_dev(div4, div3);
    			append_dev(div3, button);
    			append_dev(button, i);
    			append_dev(button, t10);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[4]),
    					listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dataPartida*/ 1 && t4_value !== (t4_value = /*dataPartida*/ ctx[0].id_partida + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*dataPartida*/ 1 && input_placeholder_value !== (input_placeholder_value = /*dataPartida*/ ctx[0].resultado_partida)) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty & /*resultadoPartidaNuevo*/ 2 && input.value !== /*resultadoPartidaNuevo*/ ctx[1]) {
    				set_input_value(input, /*resultadoPartidaNuevo*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(link0);
    			detach_dev(link1);
    			detach_dev(link2);
    			detach_dev(meta);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(body);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const apiURL = "http://127.0.0.1:5000/get_partida/";
    const apiURL2 = "http://127.0.0.1:5000/update_partida/";
    const apiURL3 = "http://127.0.0.1:5000/delete_partida/";
    const apiURLx = "http://127.0.0.1:5000/add_partida";

    function instance$7($$self, $$props, $$invalidate) {
    	let dataPartida = [];
    	let resultadoPartidaNuevo = "";
    	let { params } = $$props;
    	let idPartida = params.ID_Partida;

    	onMount(async function () {
    		const response = await fetch(apiURL + idPartida);
    		let json = await response.json();
    		$$invalidate(0, dataPartida = json);
    		console.log(dataPartida);
    	});

    	async function actualizarPartida() {
    		if (resultadoPartidaNuevo == "") $$invalidate(1, resultadoPartidaNuevo = dataPartida.resultado_partida);

    		const response = await fetch(apiURL2 + idPartida, {
    			method: "PUT",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				"id_partida": null,
    				"resultado_partida": resultadoPartidaNuevo
    			})
    		});

    		const json = await response.json();
    		let result = JSON.stringify(json);
    		console.log(result);
    		location.href = "/#/Torneos";
    	}

    	async function eliminarPartida() {
    		const response = await fetch(apiURL3 + idPartida, { method: "DELETE" });
    		const json = await response.json();
    		let result = JSON.stringify(json);
    		console.log(result);
    		location.href = "/#/Partidas";
    	}

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<EditarPartida> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("EditarPartida", $$slots, []);

    	function input_input_handler() {
    		resultadoPartidaNuevo = this.value;
    		$$invalidate(1, resultadoPartidaNuevo);
    	}

    	const click_handler = () => actualizarPartida();

    	$$self.$$set = $$props => {
    		if ("params" in $$props) $$invalidate(3, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		apiURL,
    		apiURL2,
    		apiURL3,
    		apiURLx,
    		dataPartida,
    		resultadoPartidaNuevo,
    		onMount,
    		params,
    		idPartida,
    		actualizarPartida,
    		eliminarPartida
    	});

    	$$self.$inject_state = $$props => {
    		if ("dataPartida" in $$props) $$invalidate(0, dataPartida = $$props.dataPartida);
    		if ("resultadoPartidaNuevo" in $$props) $$invalidate(1, resultadoPartidaNuevo = $$props.resultadoPartidaNuevo);
    		if ("params" in $$props) $$invalidate(3, params = $$props.params);
    		if ("idPartida" in $$props) idPartida = $$props.idPartida;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		dataPartida,
    		resultadoPartidaNuevo,
    		actualizarPartida,
    		params,
    		input_input_handler,
    		click_handler
    	];
    }

    class EditarPartida extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { params: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditarPartida",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*params*/ ctx[3] === undefined && !("params" in props)) {
    			console_1$2.warn("<EditarPartida> was created without expected prop 'params'");
    		}
    	}

    	get params() {
    		throw new Error("<EditarPartida>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<EditarPartida>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\EditarEquipo.svelte generated by Svelte v3.24.1 */
    const file$7 = "src\\EditarEquipo.svelte";

    function create_fragment$8(ctx) {
    	let body;
    	let div7;
    	let div6;
    	let div5;
    	let div0;
    	let span;
    	let t1;
    	let div4;
    	let div2;
    	let div1;
    	let input;
    	let input_placeholder_value;
    	let t2;
    	let label;
    	let t4;
    	let div3;
    	let button0;
    	let i0;
    	let t6;
    	let t7;
    	let button1;
    	let i1;
    	let t9;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			body = element("body");
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			span = element("span");
    			span.textContent = "Editar Equipo";
    			t1 = space();
    			div4 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			input = element("input");
    			t2 = space();
    			label = element("label");
    			label.textContent = "Nombre Equipo";
    			t4 = space();
    			div3 = element("div");
    			button0 = element("button");
    			i0 = element("i");
    			i0.textContent = "check_circle";
    			t6 = text("Confirmar");
    			t7 = space();
    			button1 = element("button");
    			i1 = element("i");
    			i1.textContent = "delete";
    			t9 = text("Eliminar");
    			attr_dev(span, "class", "card-title center");
    			set_style(span, "color", "#263238 ");
    			set_style(span, "font-size", "2em");
    			set_style(span, "font-weight", "bolder");
    			add_location(span, file$7, 60, 10, 1903);
    			attr_dev(div0, "class", "card-content black-text");
    			add_location(div0, file$7, 59, 8, 1853);
    			attr_dev(input, "id", "nombre_equipo");
    			set_style(input, "border-radius", "20px");
    			attr_dev(input, "placeholder", input_placeholder_value = /*dataEquipo*/ ctx[0].nombre_equipo);
    			attr_dev(input, "class", "white validate black-text");
    			add_location(input, file$7, 66, 14, 2193);
    			attr_dev(label, "class", "active");
    			attr_dev(label, "for", "nombre_equipo");
    			add_location(label, file$7, 67, 14, 2368);
    			attr_dev(div1, "class", "row input-field");
    			add_location(div1, file$7, 65, 12, 2148);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file$7, 64, 10, 2110);
    			attr_dev(i0, "class", "material-icons left ");
    			add_location(i0, file$7, 72, 109, 2619);
    			attr_dev(button0, "class", "waves-effect waves-light btn blue darken-1");
    			add_location(button0, file$7, 72, 14, 2524);
    			attr_dev(i1, "class", "material-icons left ");
    			add_location(i1, file$7, 73, 108, 2795);
    			attr_dev(button1, "class", "waves-effect waves-light btn  blue darken-1");
    			add_location(button1, file$7, 73, 14, 2701);
    			attr_dev(div3, "class", "container");
    			add_location(div3, file$7, 71, 10, 2483);
    			attr_dev(div4, "class", "card-action");
    			add_location(div4, file$7, 63, 8, 2073);
    			attr_dev(div5, "class", "col s12 m4 l8 card blue-grey lighten-5");
    			add_location(div5, file$7, 57, 6, 1762);
    			attr_dev(div6, "class", "container");
    			add_location(div6, file$7, 56, 4, 1729);
    			attr_dev(div7, "class", "container ");
    			set_style(div7, "padding-top", "10%");
    			add_location(div7, file$7, 55, 2, 1673);
    			set_style(body, "background-image", "url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)");
    			add_location(body, file$7, 54, 0, 1538);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div0);
    			append_dev(div0, span);
    			append_dev(div5, t1);
    			append_dev(div5, div4);
    			append_dev(div4, div2);
    			append_dev(div2, div1);
    			append_dev(div1, input);
    			set_input_value(input, /*nombreEquipoNuevo*/ ctx[1]);
    			append_dev(div1, t2);
    			append_dev(div1, label);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div3, button0);
    			append_dev(button0, i0);
    			append_dev(button0, t6);
    			append_dev(div3, t7);
    			append_dev(div3, button1);
    			append_dev(button1, i1);
    			append_dev(button1, t9);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[5]),
    					listen_dev(button0, "click", /*click_handler*/ ctx[6], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dataEquipo*/ 1 && input_placeholder_value !== (input_placeholder_value = /*dataEquipo*/ ctx[0].nombre_equipo)) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty & /*nombreEquipoNuevo*/ 2 && input.value !== /*nombreEquipoNuevo*/ ctx[1]) {
    				set_input_value(input, /*nombreEquipoNuevo*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const apiURLGetEquipos$1 = "http://127.0.0.1:5000/get_equipo/";
    const apiURLUpdEquipos = "http://127.0.0.1:5000/update_equipo/";
    const apiURLDelEquipos = "http://127.0.0.1:5000/delete_equipo/";

    function instance$8($$self, $$props, $$invalidate) {
    	let { params } = $$props;
    	let dataEquipo = [];
    	let nombreEquipoNuevo = "";
    	let idEquipo = params.ID_Equipo; // idEquipo para los links 

    	onMount(async function () {
    		const response = await fetch(apiURLGetEquipos$1 + idEquipo);
    		let json = await response.json();
    		$$invalidate(0, dataEquipo = json);
    	}); //console.log(dataEquipo)

    	async function actualizarEquipo() {
    		if (nombreEquipoNuevo == "") $$invalidate(1, nombreEquipoNuevo = dataEquipo.nombre_equipo);

    		const response = await fetch(apiURLUpdEquipos + idEquipo, {
    			method: "PUT",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				"id_equipo": null,
    				"nombre_equipo": nombreEquipoNuevo
    			})
    		});

    		location.href = "/#/Equipos";
    	} //const json = await response.json()
    	//let result = JSON.stringify(json)

    	//console.log(result)
    	async function eliminarEquipo() {
    		const response = await fetch(apiURLDelEquipos + idEquipo, { method: "DELETE" });
    		location.href = "/#/Equipos";
    	} //const json = await response.json()
    	//let result = JSON.stringify(json)

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<EditarEquipo> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("EditarEquipo", $$slots, []);

    	function input_input_handler() {
    		nombreEquipoNuevo = this.value;
    		$$invalidate(1, nombreEquipoNuevo);
    	}

    	const click_handler = () => actualizarEquipo();
    	const click_handler_1 = () => eliminarEquipo();

    	$$self.$$set = $$props => {
    		if ("params" in $$props) $$invalidate(4, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		params,
    		apiURLGetEquipos: apiURLGetEquipos$1,
    		apiURLUpdEquipos,
    		apiURLDelEquipos,
    		dataEquipo,
    		nombreEquipoNuevo,
    		idEquipo,
    		actualizarEquipo,
    		eliminarEquipo
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(4, params = $$props.params);
    		if ("dataEquipo" in $$props) $$invalidate(0, dataEquipo = $$props.dataEquipo);
    		if ("nombreEquipoNuevo" in $$props) $$invalidate(1, nombreEquipoNuevo = $$props.nombreEquipoNuevo);
    		if ("idEquipo" in $$props) idEquipo = $$props.idEquipo;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		dataEquipo,
    		nombreEquipoNuevo,
    		actualizarEquipo,
    		eliminarEquipo,
    		params,
    		input_input_handler,
    		click_handler,
    		click_handler_1
    	];
    }

    class EditarEquipo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { params: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EditarEquipo",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*params*/ ctx[4] === undefined && !("params" in props)) {
    			console.warn("<EditarEquipo> was created without expected prop 'params'");
    		}
    	}

    	get params() {
    		throw new Error("<EditarEquipo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<EditarEquipo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\NuevoJugador.svelte generated by Svelte v3.24.1 */

    const { console: console_1$3 } = globals;
    const file$8 = "src\\NuevoJugador.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (55:18) {#each dataServidores as servidor }
    function create_each_block$5(ctx) {
    	let option;
    	let t_value = /*servidor*/ ctx[7].region_servidor + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*servidor*/ ctx[7].id_servidor;
    			option.value = option.__value;
    			add_location(option, file$8, 55, 18, 2305);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dataServidores*/ 1 && t_value !== (t_value = /*servidor*/ ctx[7].region_servidor + "")) set_data_dev(t, t_value);

    			if (dirty & /*dataServidores*/ 1 && option_value_value !== (option_value_value = /*servidor*/ ctx[7].id_servidor)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(55:18) {#each dataServidores as servidor }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let body;
    	let div9;
    	let div8;
    	let div7;
    	let div0;
    	let span;
    	let t1;
    	let div6;
    	let div2;
    	let div1;
    	let input;
    	let t2;
    	let label0;
    	let t4;
    	let div4;
    	let div3;
    	let select;
    	let option;
    	let t6;
    	let label1;
    	let t8;
    	let div5;
    	let a;
    	let i;
    	let t10;
    	let mounted;
    	let dispose;
    	let each_value = /*dataServidores*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			body = element("body");
    			div9 = element("div");
    			div8 = element("div");
    			div7 = element("div");
    			div0 = element("div");
    			span = element("span");
    			span.textContent = "Nuevo Jugador";
    			t1 = space();
    			div6 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			input = element("input");
    			t2 = space();
    			label0 = element("label");
    			label0.textContent = "Nombre Invocador";
    			t4 = space();
    			div4 = element("div");
    			div3 = element("div");
    			select = element("select");
    			option = element("option");
    			option.textContent = "Servidor";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			label1 = element("label");
    			label1.textContent = "Nombre Servidor";
    			t8 = space();
    			div5 = element("div");
    			a = element("a");
    			i = element("i");
    			i.textContent = "check_circle";
    			t10 = text("Agregar");
    			attr_dev(span, "class", "card-title center");
    			set_style(span, "color", "#263238 ");
    			set_style(span, "font-size", "2em");
    			set_style(span, "font-weight", "bolder");
    			add_location(span, file$8, 40, 10, 1328);
    			attr_dev(div0, "class", "card-content black-text");
    			add_location(div0, file$8, 39, 8, 1278);
    			set_style(input, "border-radius", "20px");
    			attr_dev(input, "id", "Nombre_Jugador");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "white validate black-text");
    			add_location(input, file$8, 45, 14, 1588);
    			attr_dev(label0, "class", "active");
    			attr_dev(label0, "for", "Nombre_Jugador");
    			add_location(label0, file$8, 46, 14, 1796);
    			attr_dev(div1, "class", "row input-field");
    			add_location(div1, file$8, 44, 12, 1543);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file$8, 43, 10, 1505);
    			option.__value = "";
    			option.value = option.__value;
    			option.disabled = true;
    			option.selected = true;
    			add_location(option, file$8, 53, 18, 2178);
    			attr_dev(select, "id", "Servidores");
    			attr_dev(select, "class", "browser-default");
    			if (/*selected*/ ctx[1] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[5].call(select));
    			add_location(select, file$8, 52, 16, 2017);
    			attr_dev(label1, "class", "active");
    			attr_dev(label1, "for", "Servidores");
    			add_location(label1, file$8, 58, 16, 2552);
    			attr_dev(div3, "class", "row input-field");
    			add_location(div3, file$8, 51, 12, 1963);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$8, 50, 10, 1926);
    			attr_dev(i, "class", "material-icons left white-text ");
    			add_location(i, file$8, 62, 133, 2825);
    			set_style(a, "color", "white");
    			attr_dev(a, "href", "");
    			attr_dev(a, "class", "waves-effect waves-light btn deep- blue darken-1");
    			add_location(a, file$8, 62, 14, 2706);
    			attr_dev(div5, "class", "container");
    			add_location(div5, file$8, 61, 10, 2665);
    			attr_dev(div6, "class", "card-action");
    			add_location(div6, file$8, 42, 8, 1468);
    			attr_dev(div7, "class", "col s12 m4 l8 card blue-grey lighten-5");
    			add_location(div7, file$8, 38, 6, 1216);
    			attr_dev(div8, "class", "container");
    			add_location(div8, file$8, 37, 4, 1183);
    			attr_dev(div9, "class", "container ");
    			set_style(div9, "padding-top", "10%");
    			add_location(div9, file$8, 36, 2, 1127);
    			set_style(body, "background-image", "url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)");
    			add_location(body, file$8, 35, 0, 992);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div9);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			append_dev(div7, div0);
    			append_dev(div0, span);
    			append_dev(div7, t1);
    			append_dev(div7, div6);
    			append_dev(div6, div2);
    			append_dev(div2, div1);
    			append_dev(div1, input);
    			set_input_value(input, /*nombreJugadorNuevo*/ ctx[2]);
    			append_dev(div1, t2);
    			append_dev(div1, label0);
    			append_dev(div6, t4);
    			append_dev(div6, div4);
    			append_dev(div4, div3);
    			append_dev(div3, select);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*selected*/ ctx[1]);
    			append_dev(div3, t6);
    			append_dev(div3, label1);
    			append_dev(div6, t8);
    			append_dev(div6, div5);
    			append_dev(div5, a);
    			append_dev(a, i);
    			append_dev(a, t10);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[4]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[5]),
    					listen_dev(a, "click", /*click_handler*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*nombreJugadorNuevo*/ 4 && input.value !== /*nombreJugadorNuevo*/ ctx[2]) {
    				set_input_value(input, /*nombreJugadorNuevo*/ ctx[2]);
    			}

    			if (dirty & /*dataServidores*/ 1) {
    				each_value = /*dataServidores*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*selected, dataServidores*/ 3) {
    				select_option(select, /*selected*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const apiURLGetServidores$1 = "http://127.0.0.1:5000/get_servidores";
    const apiURLAddJugador = "http://127.0.0.1:5000/add_jugador";

    function instance$9($$self, $$props, $$invalidate) {
    	let dataServidores = [];
    	let selected;
    	let nombreJugadorNuevo = "";

    	onMount(async function () {
    		const response = await fetch(apiURLGetServidores$1);
    		$$invalidate(0, dataServidores = await response.json());
    		console.log(dataServidores);
    	});

    	async function crearJugador() {
    		const response = await fetch(apiURLAddJugador, {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				"id_jugador": null,
    				"id_servidor": selected,
    				"nombre_jugador": nombreJugadorNuevo
    			})
    		});

    		//const json = await response.json()
    		location.href = "/#/Jugadores";
    	} //let result = JSON.stringify(json)
    	//console.log(result)

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<NuevoJugador> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("NuevoJugador", $$slots, []);

    	function input_input_handler() {
    		nombreJugadorNuevo = this.value;
    		$$invalidate(2, nombreJugadorNuevo);
    	}

    	function select_change_handler() {
    		selected = select_value(this);
    		$$invalidate(1, selected);
    		$$invalidate(0, dataServidores);
    	}

    	const click_handler = () => crearJugador();

    	$$self.$capture_state = () => ({
    		onMount,
    		apiURLGetServidores: apiURLGetServidores$1,
    		apiURLAddJugador,
    		dataServidores,
    		selected,
    		nombreJugadorNuevo,
    		crearJugador
    	});

    	$$self.$inject_state = $$props => {
    		if ("dataServidores" in $$props) $$invalidate(0, dataServidores = $$props.dataServidores);
    		if ("selected" in $$props) $$invalidate(1, selected = $$props.selected);
    		if ("nombreJugadorNuevo" in $$props) $$invalidate(2, nombreJugadorNuevo = $$props.nombreJugadorNuevo);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		dataServidores,
    		selected,
    		nombreJugadorNuevo,
    		crearJugador,
    		input_input_handler,
    		select_change_handler,
    		click_handler
    	];
    }

    class NuevoJugador extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NuevoJugador",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\NuevoEquipo.svelte generated by Svelte v3.24.1 */

    const file$9 = "src\\NuevoEquipo.svelte";

    function create_fragment$a(ctx) {
    	let body;
    	let div7;
    	let div6;
    	let div5;
    	let div0;
    	let span;
    	let t1;
    	let div4;
    	let div2;
    	let div1;
    	let input;
    	let t2;
    	let label;
    	let t4;
    	let div3;
    	let button;
    	let i;
    	let t6;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			body = element("body");
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			span = element("span");
    			span.textContent = "Nuevo Equipo";
    			t1 = space();
    			div4 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			input = element("input");
    			t2 = space();
    			label = element("label");
    			label.textContent = "Nombre Equipo";
    			t4 = space();
    			div3 = element("div");
    			button = element("button");
    			i = element("i");
    			i.textContent = "check_circle";
    			t6 = text("Agregar");
    			attr_dev(span, "class", "card-title center");
    			set_style(span, "color", "#263238 ");
    			set_style(span, "font-size", "2em");
    			set_style(span, "font-weight", "bolder");
    			add_location(span, file$9, 28, 10, 984);
    			attr_dev(div0, "class", "card-content black-text");
    			add_location(div0, file$9, 27, 8, 906);
    			set_style(input, "border-radius", "20px");
    			attr_dev(input, "id", "nombre_equipo");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "white validate black-text");
    			add_location(input, file$9, 34, 14, 1273);
    			attr_dev(label, "class", "active ");
    			attr_dev(label, "for", "nombre_equipo ");
    			add_location(label, file$9, 35, 14, 1420);
    			attr_dev(div1, "class", "row input-field");
    			add_location(div1, file$9, 33, 12, 1228);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file$9, 32, 10, 1190);
    			attr_dev(i, "class", "material-icons left");
    			add_location(i, file$9, 40, 102, 1676);
    			attr_dev(button, "class", "waves-effect waves-light btn blue darken-1");
    			add_location(button, file$9, 40, 12, 1586);
    			attr_dev(div3, "class", "container");
    			add_location(div3, file$9, 39, 10, 1547);
    			attr_dev(div4, "class", "card-action");
    			add_location(div4, file$9, 31, 8, 1125);
    			attr_dev(div5, "class", "col s12 m4 l8 card blue-grey lighten-5");
    			add_location(div5, file$9, 25, 6, 820);
    			attr_dev(div6, "class", "container");
    			add_location(div6, file$9, 24, 4, 787);
    			attr_dev(div7, "class", "container");
    			set_style(div7, "padding-top", "10%");
    			add_location(div7, file$9, 23, 2, 732);
    			set_style(body, "background-image", "url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)");
    			add_location(body, file$9, 22, 0, 597);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div0);
    			append_dev(div0, span);
    			append_dev(div5, t1);
    			append_dev(div5, div4);
    			append_dev(div4, div2);
    			append_dev(div2, div1);
    			append_dev(div1, input);
    			set_input_value(input, /*nombreEquipoNuevo*/ ctx[0]);
    			append_dev(div1, t2);
    			append_dev(div1, label);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div3, button);
    			append_dev(button, i);
    			append_dev(button, t6);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[2]),
    					listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*nombreEquipoNuevo*/ 1 && input.value !== /*nombreEquipoNuevo*/ ctx[0]) {
    				set_input_value(input, /*nombreEquipoNuevo*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const apiURLAddEquipo = "http://127.0.0.1:5000/add_equipo";

    function instance$a($$self, $$props, $$invalidate) {
    	let nombreEquipoNuevo = "";

    	async function crearEquipo() {
    		const response = await fetch(apiURLAddEquipo, {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				"id_equipo": null,
    				"nombre_equipo": nombreEquipoNuevo
    			})
    		});

    		const json = await response.json();
    		location.href = "/#/Equipos";
    	} //let result = JSON.stringify(json)
    	//console.log(result)

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NuevoEquipo> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("NuevoEquipo", $$slots, []);

    	function input_input_handler() {
    		nombreEquipoNuevo = this.value;
    		$$invalidate(0, nombreEquipoNuevo);
    	}

    	const click_handler = () => crearEquipo();

    	$$self.$capture_state = () => ({
    		apiURLAddEquipo,
    		nombreEquipoNuevo,
    		crearEquipo
    	});

    	$$self.$inject_state = $$props => {
    		if ("nombreEquipoNuevo" in $$props) $$invalidate(0, nombreEquipoNuevo = $$props.nombreEquipoNuevo);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [nombreEquipoNuevo, crearEquipo, input_input_handler, click_handler];
    }

    class NuevoEquipo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NuevoEquipo",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\NuevoTorneo.svelte generated by Svelte v3.24.1 */

    const file$a = "src\\NuevoTorneo.svelte";

    function create_fragment$b(ctx) {
    	let body;
    	let div7;
    	let div6;
    	let div5;
    	let div0;
    	let span;
    	let t1;
    	let div4;
    	let div2;
    	let div1;
    	let input;
    	let t2;
    	let label;
    	let t4;
    	let div3;
    	let button;
    	let i;
    	let t6;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			body = element("body");
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			span = element("span");
    			span.textContent = "Nuevo Torneo";
    			t1 = space();
    			div4 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			input = element("input");
    			t2 = space();
    			label = element("label");
    			label.textContent = "Nombre Torneo";
    			t4 = space();
    			div3 = element("div");
    			button = element("button");
    			i = element("i");
    			i.textContent = "check_circle";
    			t6 = text("Agregar");
    			attr_dev(span, "class", "card-title center ");
    			set_style(span, "color", "#263238 ");
    			set_style(span, "font-size", "2em");
    			set_style(span, "font-weight", "bolder");
    			add_location(span, file$a, 27, 10, 946);
    			attr_dev(div0, "class", "card-content black-text thick ");
    			add_location(div0, file$a, 26, 8, 889);
    			set_style(input, "border-radius", "20px");
    			attr_dev(input, "id", "first_name");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "white validate black-text");
    			add_location(input, file$a, 33, 12, 1221);
    			attr_dev(label, "class", "active ");
    			attr_dev(label, "for", "first_name ");
    			add_location(label, file$a, 34, 14, 1365);
    			attr_dev(div1, "class", "row input-field col s6 offset ");
    			add_location(div1, file$a, 32, 12, 1163);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file$a, 31, 10, 1125);
    			attr_dev(i, "class", "material-icons left ");
    			add_location(i, file$a, 38, 105, 1610);
    			attr_dev(button, "class", "waves-effect waves-light btn  blue darken-1");
    			add_location(button, file$a, 38, 14, 1519);
    			attr_dev(div3, "class", "container");
    			add_location(div3, file$a, 37, 10, 1478);
    			attr_dev(div4, "class", "card-action");
    			add_location(div4, file$a, 30, 8, 1088);
    			attr_dev(div5, "class", "col s12 m4 l8 card blue-grey lighten-5");
    			add_location(div5, file$a, 25, 6, 827);
    			attr_dev(div6, "class", "container");
    			add_location(div6, file$a, 24, 4, 794);
    			attr_dev(div7, "class", "container ");
    			set_style(div7, "padding-top", "10%");
    			add_location(div7, file$a, 23, 2, 738);
    			set_style(body, "background-image", "url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)");
    			add_location(body, file$a, 22, 0, 603);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div0);
    			append_dev(div0, span);
    			append_dev(div5, t1);
    			append_dev(div5, div4);
    			append_dev(div4, div2);
    			append_dev(div2, div1);
    			append_dev(div1, input);
    			set_input_value(input, /*nombreTorneoNuevo*/ ctx[0]);
    			append_dev(div1, t2);
    			append_dev(div1, label);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div3, button);
    			append_dev(button, i);
    			append_dev(button, t6);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[2]),
    					listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*nombreTorneoNuevo*/ 1 && input.value !== /*nombreTorneoNuevo*/ ctx[0]) {
    				set_input_value(input, /*nombreTorneoNuevo*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const apiURLAddTorneo = "http://127.0.0.1:5000/add_torneo";

    function instance$b($$self, $$props, $$invalidate) {
    	let nombreTorneoNuevo = "";

    	async function crearTorneo() {
    		const response = await fetch(apiURLAddTorneo, {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				"id_torneo": null,
    				"nombre_torneo": nombreTorneoNuevo
    			})
    		});

    		location.href = "/#/Torneos";
    	} //const json = await response.json()
    	//let result = JSON.stringify(json)

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NuevoTorneo> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("NuevoTorneo", $$slots, []);

    	function input_input_handler() {
    		nombreTorneoNuevo = this.value;
    		$$invalidate(0, nombreTorneoNuevo);
    	}

    	const click_handler = () => crearTorneo();

    	$$self.$capture_state = () => ({
    		apiURLAddTorneo,
    		nombreTorneoNuevo,
    		crearTorneo
    	});

    	$$self.$inject_state = $$props => {
    		if ("nombreTorneoNuevo" in $$props) $$invalidate(0, nombreTorneoNuevo = $$props.nombreTorneoNuevo);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [nombreTorneoNuevo, crearTorneo, input_input_handler, click_handler];
    }

    class NuevoTorneo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NuevoTorneo",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\NuevaPartida.svelte generated by Svelte v3.24.1 */

    const { console: console_1$4 } = globals;
    const file$b = "src\\NuevaPartida.svelte";

    function create_fragment$c(ctx) {
    	let body;
    	let div7;
    	let div6;
    	let div5;
    	let div0;
    	let span;
    	let t1;
    	let div4;
    	let div2;
    	let div1;
    	let input;
    	let t2;
    	let label;
    	let t4;
    	let div3;
    	let a;
    	let i;
    	let t6;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			body = element("body");
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			span = element("span");
    			span.textContent = "Nueva Partida";
    			t1 = space();
    			div4 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			input = element("input");
    			t2 = space();
    			label = element("label");
    			label.textContent = "Resultado Partida";
    			t4 = space();
    			div3 = element("div");
    			a = element("a");
    			i = element("i");
    			i.textContent = "check_circle";
    			t6 = text("Agregar");
    			attr_dev(span, "class", "card-title center ");
    			set_style(span, "color", "#263238 ");
    			set_style(span, "font-size", "2em");
    			set_style(span, "font-weight", "bolder");
    			add_location(span, file$b, 27, 10, 928);
    			attr_dev(div0, "class", "card-content black-text thick ");
    			add_location(div0, file$b, 26, 8, 871);
    			set_style(input, "border-radius", "20px");
    			attr_dev(input, "id", "first_name");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "white validate black-text");
    			add_location(input, file$b, 33, 12, 1204);
    			attr_dev(label, "class", "active ");
    			attr_dev(label, "for", "first_name ");
    			add_location(label, file$b, 34, 14, 1349);
    			attr_dev(div1, "class", "row input-field col s6 offset ");
    			add_location(div1, file$b, 32, 12, 1146);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file$b, 31, 10, 1108);
    			attr_dev(i, "class", "material-icons left #4527a0  white-text ");
    			add_location(i, file$b, 40, 111, 1628);
    			attr_dev(a, "class", "waves-effect waves-light btn  blue darken-1 white-text");
    			add_location(a, file$b, 40, 14, 1531);
    			attr_dev(div3, "class", "container");
    			add_location(div3, file$b, 39, 10, 1490);
    			attr_dev(div4, "class", "card-action");
    			add_location(div4, file$b, 30, 8, 1071);
    			attr_dev(div5, "class", "col s12 m4 l8 card blue-grey lighten-5");
    			add_location(div5, file$b, 25, 6, 809);
    			attr_dev(div6, "class", "container");
    			add_location(div6, file$b, 24, 4, 776);
    			attr_dev(div7, "class", "container ");
    			set_style(div7, "padding-top", "10%");
    			add_location(div7, file$b, 23, 2, 720);
    			set_style(body, "background-image", "url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)");
    			add_location(body, file$b, 22, 0, 585);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div0);
    			append_dev(div0, span);
    			append_dev(div5, t1);
    			append_dev(div5, div4);
    			append_dev(div4, div2);
    			append_dev(div2, div1);
    			append_dev(div1, input);
    			set_input_value(input, /*nombrePartidaNueva*/ ctx[0]);
    			append_dev(div1, t2);
    			append_dev(div1, label);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div3, a);
    			append_dev(a, i);
    			append_dev(a, t6);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[2]),
    					listen_dev(a, "click", /*click_handler*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*nombrePartidaNueva*/ 1 && input.value !== /*nombrePartidaNueva*/ ctx[0]) {
    				set_input_value(input, /*nombrePartidaNueva*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const apiURL$1 = "http://127.0.0.1:5000/add_partida";

    function instance$c($$self, $$props, $$invalidate) {
    	let nombrePartidaNueva = "";

    	async function crearPartida() {
    		const response = await fetch(apiURL$1, {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				"id_partida": null,
    				"resultado_partida": nombrePartidaNueva
    			})
    		});

    		const json = await response.json();
    		let result = JSON.stringify(json);
    		location.href = "/#/Partidas";
    		console.log(result);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$4.warn(`<NuevaPartida> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("NuevaPartida", $$slots, []);

    	function input_input_handler() {
    		nombrePartidaNueva = this.value;
    		$$invalidate(0, nombrePartidaNueva);
    	}

    	const click_handler = () => crearPartida();
    	$$self.$capture_state = () => ({ apiURL: apiURL$1, nombrePartidaNueva, crearPartida });

    	$$self.$inject_state = $$props => {
    		if ("nombrePartidaNueva" in $$props) $$invalidate(0, nombrePartidaNueva = $$props.nombrePartidaNueva);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [nombrePartidaNueva, crearPartida, input_input_handler, click_handler];
    }

    class NuevaPartida extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NuevaPartida",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\PerfilJugador.svelte generated by Svelte v3.24.1 */
    const file$c = "src\\PerfilJugador.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (102:9) {#each dataPerfil as perfil }
    function create_each_block_2(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t = space();
    			attr_dev(img, "alt", "");
    			if (img.src !== (img_src_value = obtenerImagen(/*perfil*/ ctx[4].tier))) attr_dev(img, "src", img_src_value);
    			add_location(img, file$c, 103, 15, 3220);
    			set_style(div, "text-align", "center");
    			attr_dev(div, "class", "container col s6");
    			add_location(div, file$c, 102, 13, 3144);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dataPerfil*/ 1 && img.src !== (img_src_value = obtenerImagen(/*perfil*/ ctx[4].tier))) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(102:9) {#each dataPerfil as perfil }",
    		ctx
    	});

    	return block;
    }

    // (115:12) {#each dataPerfil as perfil }
    function create_each_block_1(ctx) {
    	let div;
    	let span;
    	let t0_value = "Rango: " + /*perfil*/ ctx[4].tier + "   " + /*perfil*/ ctx[4].rank + "\n" + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(span, "align", "center");
    			attr_dev(span, "class", "centered flow-text");
    			add_location(span, file$c, 116, 16, 3522);
    			set_style(div, "text-align", "center");
    			attr_dev(div, "class", "col s6");
    			add_location(div, file$c, 115, 14, 3456);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dataPerfil*/ 1 && t0_value !== (t0_value = "Rango: " + /*perfil*/ ctx[4].tier + "   " + /*perfil*/ ctx[4].rank + "\n" + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(115:12) {#each dataPerfil as perfil }",
    		ctx
    	});

    	return block;
    }

    // (123:14) {#each dataPerfil as perfil }
    function create_each_block$6(ctx) {
    	let div;
    	let span;
    	let t0_value = "Wins: " + /*perfil*/ ctx[4].wins + "   " + "Losses:  " + /*perfil*/ ctx[4].losses + "\n" + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(span, "align", "center");
    			attr_dev(span, "class", "centered flow-text");
    			add_location(span, file$c, 124, 18, 3843);
    			set_style(div, "text-align", "center");
    			attr_dev(div, "class", "col s6");
    			add_location(div, file$c, 123, 16, 3776);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dataPerfil*/ 1 && t0_value !== (t0_value = "Wins: " + /*perfil*/ ctx[4].wins + "   " + "Losses:  " + /*perfil*/ ctx[4].losses + "\n" + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(123:14) {#each dataPerfil as perfil }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let body;
    	let div6;
    	let div5;
    	let div0;
    	let h1;
    	let t0_value = /*parametros*/ ctx[1][1] + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let div4;
    	let div2;
    	let t3;
    	let div3;
    	let each_value_2 = /*dataPerfil*/ ctx[0];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*dataPerfil*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*dataPerfil*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			body = element("body");
    			div6 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t2 = space();
    			div4 = element("div");
    			div2 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t3 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file$c, 95, 9, 3011);
    			attr_dev(div0, "class", "card-content ");
    			add_location(div0, file$c, 94, 8, 2974);
    			attr_dev(div1, "class", "row");
    			add_location(div1, file$c, 99, 8, 3070);
    			attr_dev(div2, "class", "row ");
    			add_location(div2, file$c, 110, 10, 3366);
    			attr_dev(div3, "class", "row ");
    			add_location(div3, file$c, 121, 10, 3696);
    			attr_dev(div4, "class", "card-content");
    			add_location(div4, file$c, 109, 8, 3328);
    			attr_dev(div5, "class", " card blue-grey lighten-5");
    			add_location(div5, file$c, 92, 6, 2919);
    			attr_dev(div6, "class", "container");
    			add_location(div6, file$c, 90, 2, 2884);
    			set_style(body, "background-image", "url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)");
    			add_location(body, file$c, 89, 0, 2750);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			append_dev(div5, t1);
    			append_dev(div5, div1);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div1, null);
    			}

    			append_dev(div5, t2);
    			append_dev(div5, div4);
    			append_dev(div4, div2);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div2, null);
    			}

    			append_dev(div4, t3);
    			append_dev(div4, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*parametros*/ 2 && t0_value !== (t0_value = /*parametros*/ ctx[1][1] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*obtenerImagen, dataPerfil*/ 1) {
    				each_value_2 = /*dataPerfil*/ ctx[0];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*dataPerfil*/ 1) {
    				each_value_1 = /*dataPerfil*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*dataPerfil*/ 1) {
    				each_value = /*dataPerfil*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div3, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const apiURLGetPerfilRiot = "http://127.0.0.1:5000/get_perfil/";

    function obtenerImagen(rango) {
    	let ImagenRango = "";

    	switch (rango) {
    		case "IRON":
    			ImagenRango = "https://i.imgur.com/dONSpQ1.png";
    			break;
    		case "BRONZE":
    			ImagenRango = "https://i.imgur.com/OO2iZ5e.png";
    			break;
    		case "SILVER":
    			ImagenRango = "https://i.imgur.com/K6Egl6R.png";
    			break;
    		case "GOLD":
    			ImagenRango = "https://i.imgur.com/2oJvJ30.png";
    			break;
    		case "PLATINUM":
    			ImagenRango = "https://i.imgur.com/axJyRwY.png";
    			break;
    		case "DIAMOND":
    			ImagenRango = "https://i.imgur.com/V7fWTbS.png";
    			break;
    		case "MASTER":
    			ImagenRango = "https://i.imgur.com/G9iX9pf.png";
    			break;
    		case "GRANDMASTER":
    			ImagenRango = "https://i.imgur.com/MAQhZJI.png";
    			break;
    		case "CHALLENGER":
    			ImagenRango = "https://i.imgur.com/QcvJWlV.png";
    			break;
    		default:
    			ImagenRango = "https://i.imgur.com/KpSAlVF.png";
    	}

    	return ImagenRango;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { params } = $$props;
    	let dataPerfil = [];
    	let parametros = [];

    	// a la url de esta pagina le pasamos concatenado los dos parametros como uno solo (LA1*BNarco), y despues los dividimos con split y los metemos en el vector parametros
    	let ParametroCompleto = params.ID_Servidor;

    	parametros = ParametroCompleto.split("*");

    	onMount(async function () {
    		const response = await fetch(apiURLGetPerfilRiot + parametros[0] + "/" + parametros[1]);
    		let json = await response.json();
    		$$invalidate(0, dataPerfil = JSON.parse(json));
    	}); //console.log(dataPerfil)

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PerfilJugador> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("PerfilJugador", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("params" in $$props) $$invalidate(2, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		params,
    		onMount,
    		apiURLGetPerfilRiot,
    		dataPerfil,
    		parametros,
    		ParametroCompleto,
    		obtenerImagen
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(2, params = $$props.params);
    		if ("dataPerfil" in $$props) $$invalidate(0, dataPerfil = $$props.dataPerfil);
    		if ("parametros" in $$props) $$invalidate(1, parametros = $$props.parametros);
    		if ("ParametroCompleto" in $$props) ParametroCompleto = $$props.ParametroCompleto;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [dataPerfil, parametros, params];
    }

    class PerfilJugador extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { params: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PerfilJugador",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*params*/ ctx[2] === undefined && !("params" in props)) {
    			console.warn("<PerfilJugador> was created without expected prop 'params'");
    		}
    	}

    	get params() {
    		throw new Error("<PerfilJugador>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<PerfilJugador>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\PerfilEquipo.svelte generated by Svelte v3.24.1 */

    const { console: console_1$5 } = globals;
    const file$d = "src\\PerfilEquipo.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (51:10) {#each dataJugadores as row}
    function create_each_block$7(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*row*/ ctx[5].id_servidor + "";
    	let t0;
    	let t1;
    	let td1;
    	let a0;
    	let t2_value = /*row*/ ctx[5].nombre_jugador + "";
    	let t2;
    	let a0_href_value;
    	let t3;
    	let td2;
    	let a1;
    	let i;
    	let t5;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[4](/*row*/ ctx[5], ...args);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			a0 = element("a");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			a1 = element("a");
    			i = element("i");
    			i.textContent = "delete";
    			t5 = space();
    			attr_dev(td0, "class", "blue-text");
    			add_location(td0, file$d, 52, 14, 1800);
    			attr_dev(a0, "href", a0_href_value = "/#/PerfilJugador/" + /*row*/ ctx[5].id_servidor + "*" + /*row*/ ctx[5].nombre_jugador);
    			add_location(a0, file$d, 53, 18, 1863);
    			add_location(td1, file$d, 53, 14, 1859);
    			attr_dev(i, "class", "material-icons left blue-text ");
    			add_location(i, file$d, 54, 96, 2055);
    			set_style(a1, "cursor", "pointer");
    			add_location(a1, file$d, 54, 18, 1977);
    			add_location(td2, file$d, 54, 14, 1973);
    			add_location(tr, file$d, 51, 12, 1781);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, a0);
    			append_dev(a0, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, a1);
    			append_dev(a1, i);
    			append_dev(tr, t5);

    			if (!mounted) {
    				dispose = listen_dev(a1, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*dataJugadores*/ 1 && t0_value !== (t0_value = /*row*/ ctx[5].id_servidor + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*dataJugadores*/ 1 && t2_value !== (t2_value = /*row*/ ctx[5].nombre_jugador + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*dataJugadores*/ 1 && a0_href_value !== (a0_href_value = "/#/PerfilJugador/" + /*row*/ ctx[5].id_servidor + "*" + /*row*/ ctx[5].nombre_jugador)) {
    				attr_dev(a0, "href", a0_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(51:10) {#each dataJugadores as row}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let body;
    	let div;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t4;
    	let tbody;
    	let t5;
    	let a;
    	let i;
    	let a_href_value;
    	let each_value = /*dataJugadores*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			body = element("body");
    			div = element("div");
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Servidor";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Jugador";
    			t3 = space();
    			th2 = element("th");
    			t4 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			a = element("a");
    			i = element("i");
    			i.textContent = "add";
    			add_location(th0, file$d, 44, 12, 1571);
    			add_location(th1, file$d, 45, 12, 1602);
    			add_location(th2, file$d, 46, 12, 1632);
    			add_location(tr, file$d, 43, 10, 1554);
    			attr_dev(thead, "class", "blue darken-1 white-text");
    			add_location(thead, file$d, 42, 8, 1503);
    			set_style(tbody, "background", "rgba(0,0,0,0.5)");
    			add_location(tbody, file$d, 49, 8, 1683);
    			attr_dev(table, "class", "highlight centered ");
    			add_location(table, file$d, 41, 6, 1459);
    			attr_dev(i, "class", "material-icons left");
    			add_location(i, file$d, 60, 114, 2429);
    			attr_dev(a, "href", a_href_value = "/#/NuevoJugadorEquipo/" + /*idEquipo*/ ctx[1]);
    			attr_dev(a, "class", "btn-floating btn-large waves-effect waves- blue darken-1");
    			add_location(a, file$d, 60, 6, 2321);
    			attr_dev(div, "class", "container");
    			set_style(div, "padding-top", "7%");
    			add_location(div, file$d, 40, 4, 1404);
    			set_style(body, "background-image", "url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)");
    			add_location(body, file$d, 39, 2, 1269);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div);
    			append_dev(div, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(table, t4);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(div, t5);
    			append_dev(div, a);
    			append_dev(a, i);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*BorrarJugadorEquipo, dataJugadores*/ 5) {
    				each_value = /*dataJugadores*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const apiURLGetEquiJugadores = "http://127.0.0.1:5000/get_equi_jugas/";
    const apiURLGetJugador$1 = "http://127.0.0.1:5000/get_jugador/";
    const apiURLDelJugadorEquipo = "http://127.0.0.1:5000/delete_equi_juga/";

    function instance$e($$self, $$props, $$invalidate) {
    	let { params } = $$props;
    	let idEquipo = params.ID_Equipo; // para la url de la api
    	let dataJugadores = [];

    	onMount(async function () {
    		let dataJugadoresAux = [];
    		const response = await fetch(apiURLGetEquiJugadores + idEquipo);
    		let dataJugadoresEquipo = await response.json();

    		for (let i = 0; i < dataJugadoresEquipo.length; i++) {
    			const response = await fetch(apiURLGetJugador$1 + dataJugadoresEquipo[i].id_jugador);
    			let dataJugador = await response.json();
    			dataJugadoresAux.push(dataJugador);
    		}

    		$$invalidate(0, dataJugadores = dataJugadoresAux); // svelte no reacciona push.....
    	});

    	async function BorrarJugadorEquipo(p_id_jugador) {
    		// elimina la relacion equipo torneo partida
    		const response = await fetch(apiURLDelJugadorEquipo + idEquipo + "/" + p_id_jugador, { method: "DELETE" });

    		const json = await response.json();
    		let result = JSON.stringify(json);
    		console.log(result);
    		location.reload();
    	}

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$5.warn(`<PerfilEquipo> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("PerfilEquipo", $$slots, []);
    	const click_handler = row => BorrarJugadorEquipo(row.id_jugador);

    	$$self.$$set = $$props => {
    		if ("params" in $$props) $$invalidate(3, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		params,
    		idEquipo,
    		apiURLGetEquiJugadores,
    		apiURLGetJugador: apiURLGetJugador$1,
    		apiURLDelJugadorEquipo,
    		dataJugadores,
    		BorrarJugadorEquipo
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(3, params = $$props.params);
    		if ("idEquipo" in $$props) $$invalidate(1, idEquipo = $$props.idEquipo);
    		if ("dataJugadores" in $$props) $$invalidate(0, dataJugadores = $$props.dataJugadores);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [dataJugadores, idEquipo, BorrarJugadorEquipo, params, click_handler];
    }

    class PerfilEquipo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { params: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PerfilEquipo",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*params*/ ctx[3] === undefined && !("params" in props)) {
    			console_1$5.warn("<PerfilEquipo> was created without expected prop 'params'");
    		}
    	}

    	get params() {
    		throw new Error("<PerfilEquipo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<PerfilEquipo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\PerfilTorneo.svelte generated by Svelte v3.24.1 */

    const { console: console_1$6 } = globals;
    const file$e = "src\\PerfilTorneo.svelte";

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (125:8) {#each dataEquiposTorneo as row}
    function create_each_block_1$1(ctx) {
    	let tr;
    	let td0;
    	let a0;
    	let t0_value = /*row*/ ctx[9].nombre_equipo + "";
    	let t0;
    	let a0_href_value;
    	let t1;
    	let td1;
    	let a1;
    	let i;
    	let a1_href_value;
    	let t3;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[6](/*row*/ ctx[9], ...args);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			a0 = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			a1 = element("a");
    			i = element("i");
    			i.textContent = "delete";
    			t3 = space();
    			attr_dev(a0, "href", a0_href_value = "/#/PerfilEquipo/" + /*row*/ ctx[9].id_equipo);
    			add_location(a0, file$e, 126, 32, 5886);
    			attr_dev(td0, "class", "blue-text");
    			add_location(td0, file$e, 126, 10, 5864);
    			attr_dev(i, "class", "material-icons left blue-text");
    			add_location(i, file$e, 127, 107, 6064);
    			attr_dev(a1, "href", a1_href_value = "/#/PerfilTorneo/" + /*idTorneo*/ ctx[2]);
    			add_location(a1, file$e, 127, 14, 5971);
    			add_location(td1, file$e, 127, 10, 5967);
    			add_location(tr, file$e, 125, 10, 5849);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, a0);
    			append_dev(a0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, a1);
    			append_dev(a1, i);
    			append_dev(tr, t3);

    			if (!mounted) {
    				dispose = listen_dev(a1, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*dataEquiposTorneo*/ 1 && t0_value !== (t0_value = /*row*/ ctx[9].nombre_equipo + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*dataEquiposTorneo*/ 1 && a0_href_value !== (a0_href_value = "/#/PerfilEquipo/" + /*row*/ ctx[9].id_equipo)) {
    				attr_dev(a0, "href", a0_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(125:8) {#each dataEquiposTorneo as row}",
    		ctx
    	});

    	return block;
    }

    // (147:12) {#each dataMatches as row}
    function create_each_block$8(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*row*/ ctx[9].resultado_partida + "";
    	let t0;
    	let t1;
    	let td1;
    	let a0;
    	let t2_value = /*row*/ ctx[9].equipo1 + "";
    	let t2;
    	let a0_href_value;
    	let t3;
    	let td2;
    	let a1;
    	let t4_value = /*row*/ ctx[9].equipo2 + "";
    	let t4;
    	let a1_href_value;
    	let t5;
    	let td3;
    	let a2;
    	let i0;
    	let a2_href_value;
    	let t7;
    	let a3;
    	let i1;
    	let t9;
    	let mounted;
    	let dispose;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[7](/*row*/ ctx[9], ...args);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			a0 = element("a");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			a1 = element("a");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			a2 = element("a");
    			i0 = element("i");
    			i0.textContent = "edit";
    			t7 = space();
    			a3 = element("a");
    			i1 = element("i");
    			i1.textContent = "delete";
    			t9 = space();
    			attr_dev(td0, "class", "blue-text");
    			add_location(td0, file$e, 148, 14, 6788);
    			attr_dev(a0, "href", a0_href_value = "/#/PerfilEquipo/" + /*row*/ ctx[9].id_equipo1);
    			add_location(a0, file$e, 149, 36, 6875);
    			attr_dev(td1, "class", "blue-text");
    			add_location(td1, file$e, 149, 14, 6853);
    			attr_dev(a1, "href", a1_href_value = "/#/PerfilEquipo/" + /*row*/ ctx[9].id_equipo2);
    			add_location(a1, file$e, 150, 36, 6978);
    			attr_dev(td2, "class", "blue-text");
    			add_location(td2, file$e, 150, 14, 6956);
    			attr_dev(i0, "class", "material-icons left blue-text");
    			add_location(i0, file$e, 152, 60, 7123);
    			attr_dev(a2, "href", a2_href_value = "/#/EditarPartida/" + /*row*/ ctx[9].id_partida);
    			add_location(a2, file$e, 152, 16, 7079);
    			attr_dev(i1, "class", "material-icons left blue-text ");
    			add_location(i1, file$e, 153, 117, 7294);
    			attr_dev(a3, "href", "#0");
    			add_location(a3, file$e, 153, 16, 7193);
    			add_location(td3, file$e, 151, 14, 7058);
    			add_location(tr, file$e, 147, 14, 6769);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, a0);
    			append_dev(a0, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, a1);
    			append_dev(a1, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, a2);
    			append_dev(a2, i0);
    			append_dev(td3, t7);
    			append_dev(td3, a3);
    			append_dev(a3, i1);
    			append_dev(tr, t9);

    			if (!mounted) {
    				dispose = listen_dev(a3, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*dataMatches*/ 2 && t0_value !== (t0_value = /*row*/ ctx[9].resultado_partida + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*dataMatches*/ 2 && t2_value !== (t2_value = /*row*/ ctx[9].equipo1 + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*dataMatches*/ 2 && a0_href_value !== (a0_href_value = "/#/PerfilEquipo/" + /*row*/ ctx[9].id_equipo1)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (dirty & /*dataMatches*/ 2 && t4_value !== (t4_value = /*row*/ ctx[9].equipo2 + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*dataMatches*/ 2 && a1_href_value !== (a1_href_value = "/#/PerfilEquipo/" + /*row*/ ctx[9].id_equipo2)) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if (dirty & /*dataMatches*/ 2 && a2_href_value !== (a2_href_value = "/#/EditarPartida/" + /*row*/ ctx[9].id_partida)) {
    				attr_dev(a2, "href", a2_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$8.name,
    		type: "each",
    		source: "(147:12) {#each dataMatches as row}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let body;
    	let div1;
    	let table0;
    	let thead0;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t2;
    	let tbody0;
    	let t3;
    	let a0;
    	let i0;
    	let a0_href_value;
    	let t5;
    	let div0;
    	let table1;
    	let thead1;
    	let tr1;
    	let th2;
    	let t7;
    	let th3;
    	let t9;
    	let th4;
    	let t11;
    	let th5;
    	let t12;
    	let tbody1;
    	let t13;
    	let a1;
    	let i1;
    	let a1_href_value;
    	let each_value_1 = /*dataEquiposTorneo*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = /*dataMatches*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			body = element("body");
    			div1 = element("div");
    			table0 = element("table");
    			thead0 = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Equipo";
    			t1 = space();
    			th1 = element("th");
    			t2 = space();
    			tbody0 = element("tbody");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t3 = space();
    			a0 = element("a");
    			i0 = element("i");
    			i0.textContent = "add";
    			t5 = space();
    			div0 = element("div");
    			table1 = element("table");
    			thead1 = element("thead");
    			tr1 = element("tr");
    			th2 = element("th");
    			th2.textContent = "Resultado";
    			t7 = space();
    			th3 = element("th");
    			th3.textContent = "Equipo 1";
    			t9 = space();
    			th4 = element("th");
    			th4.textContent = "Equipo 2";
    			t11 = space();
    			th5 = element("th");
    			t12 = space();
    			tbody1 = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t13 = space();
    			a1 = element("a");
    			i1 = element("i");
    			i1.textContent = "add";
    			add_location(th0, file$e, 119, 10, 5680);
    			add_location(th1, file$e, 120, 10, 5706);
    			add_location(tr0, file$e, 118, 8, 5665);
    			attr_dev(thead0, "class", "blue darken-1 white-text");
    			add_location(thead0, file$e, 117, 6, 5616);
    			set_style(tbody0, "background", "rgba(0,0,0,0.5)");
    			add_location(tbody0, file$e, 123, 6, 5751);
    			attr_dev(table0, "class", "highlight centered ");
    			add_location(table0, file$e, 116, 4, 5574);
    			attr_dev(i0, "class", "material-icons left");
    			add_location(i0, file$e, 133, 113, 6305);
    			attr_dev(a0, "href", a0_href_value = "/#/NuevoEquipoTorneo/" + /*idTorneo*/ ctx[2]);
    			attr_dev(a0, "class", "btn-floating btn-large waves-effect waves- blue darken-1");
    			add_location(a0, file$e, 133, 6, 6198);
    			add_location(th2, file$e, 139, 14, 6512);
    			add_location(th3, file$e, 140, 14, 6546);
    			add_location(th4, file$e, 141, 14, 6579);
    			add_location(th5, file$e, 142, 14, 6612);
    			add_location(tr1, file$e, 138, 12, 6493);
    			attr_dev(thead1, "class", "blue darken-1 white-text");
    			add_location(thead1, file$e, 137, 10, 6440);
    			set_style(tbody1, "background", "rgba(0,0,0,0.5)");
    			add_location(tbody1, file$e, 145, 10, 6669);
    			attr_dev(table1, "class", "highlight centered ");
    			add_location(table1, file$e, 136, 8, 6394);
    			set_style(div0, "padding-top", "2%");
    			add_location(div0, file$e, 135, 6, 6357);
    			attr_dev(i1, "class", "material-icons left");
    			add_location(i1, file$e, 160, 120, 7580);
    			attr_dev(a1, "href", a1_href_value = "/#/NuevoEquipoTorneoPartida/" + /*idTorneo*/ ctx[2]);
    			attr_dev(a1, "class", "btn-floating btn-large waves-effect waves- blue darken-1");
    			add_location(a1, file$e, 160, 6, 7466);
    			attr_dev(div1, "class", "container");
    			set_style(div1, "padding-top", "7%");
    			add_location(div1, file$e, 115, 2, 5521);
    			set_style(body, "background-image", "url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)");
    			add_location(body, file$e, 114, 0, 5388);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div1);
    			append_dev(div1, table0);
    			append_dev(table0, thead0);
    			append_dev(thead0, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, th1);
    			append_dev(table0, t2);
    			append_dev(table0, tbody0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tbody0, null);
    			}

    			append_dev(div1, t3);
    			append_dev(div1, a0);
    			append_dev(a0, i0);
    			append_dev(div1, t5);
    			append_dev(div1, div0);
    			append_dev(div0, table1);
    			append_dev(table1, thead1);
    			append_dev(thead1, tr1);
    			append_dev(tr1, th2);
    			append_dev(tr1, t7);
    			append_dev(tr1, th3);
    			append_dev(tr1, t9);
    			append_dev(tr1, th4);
    			append_dev(tr1, t11);
    			append_dev(tr1, th5);
    			append_dev(table1, t12);
    			append_dev(table1, tbody1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody1, null);
    			}

    			append_dev(div1, t13);
    			append_dev(div1, a1);
    			append_dev(a1, i1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*idTorneo, desinscribirEquipoTorneo, dataEquiposTorneo*/ 13) {
    				each_value_1 = /*dataEquiposTorneo*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(tbody0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*BorrarPartidaEquipoTorneo, dataMatches*/ 18) {
    				each_value = /*dataMatches*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$8(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$8(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const apiURLGetEquisTorneo = "http://127.0.0.1:5000/get_equis_torneo/"; // equipos de un torneo
    const apiURLGetEquipo = "http://127.0.0.1:5000/get_equipo/"; // datos de un equipo
    const apiURLGetEquistorneoPartida = "http://127.0.0.1:5000/get_equis_torneo_partidas/"; // trae todas las partidas de un torneo con sus equipos
    const apiURLGetPartida = "http://127.0.0.1:5000/get_partida/"; // obtener partida
    const apiURLDelEquiTorneo = "http://127.0.0.1:5000/delete_equi_torneo/"; // borrar un equipo de un torneo
    const apiURLDelPartida = "http://127.0.0.1:5000/delete_partida/"; //borrar una partida
    const apiURLDelEquiTorneoPartida = "http://127.0.0.1:5000/delete_equi_torneo_partida/"; // borrar una partida de un torneo con el equipo que la jugo (1 solo) se hace 2 veces

    function GetSortOrder(prop) {
    	// es para ordenar un array de json con (id_partida)
    	return function (a, b) {
    		if (a[prop] > b[prop]) {
    			return 1;
    		} else if (a[prop] < b[prop]) {
    			return -1;
    		}

    		return 0;
    	};
    }

    async function eliminarPartida(p_idPartida) {
    	// elimina la partida de la tabla partidas
    	const response = await fetch(apiURLDelPartida + p_idPartida, { method: "DELETE" });
    } //const json = await response.json()
    //let result = JSON.stringify(json)

    function instance$f($$self, $$props, $$invalidate) {
    	let { params } = $$props;
    	let idTorneo = params.ID_torneo; // para las url de la api
    	let dataEquiposTorneo = [];

    	//let dataEquiposTorneo = [];
    	let dataMatches = [];

    	onMount(async function () {
    		// trae los equipos de un torneo
    		let dataEquiposTorneoAux = [];

    		const response = await fetch(apiURLGetEquisTorneo + idTorneo);
    		let jsonEquiposTorneo = await response.json(); // json tiene la relacion de equitorneo(id equipo y id torneo)

    		for (let i = 0; i < jsonEquiposTorneo.length; i++) {
    			// por cada iteracion traemos los datos de un equipo...
    			const response2 = await fetch(apiURLGetEquipo + jsonEquiposTorneo[i].id_equipo);

    			let json2 = await response2.json();
    			dataEquiposTorneoAux.push(json2); // metemos un equipo al vector de equipos
    		}

    		$$invalidate(0, dataEquiposTorneo = dataEquiposTorneoAux); // svelte no reacciona push.....
    	});

    	onMount(async function () {
    		let dataMatchesAux = [];
    		const response = await fetch(apiURLGetEquistorneoPartida + idTorneo); // traemos las partidas de los equipos en 1 torneo 
    		let dataEquiposTorneoPartida = await response.json(); // response tiene la relacion equitornepartida (id_torneo,id_equipo,id_partida)
    		dataEquiposTorneoPartida.sort(GetSortOrder("id_partida")); // ordenar por id partida para poder tomar de a pares
    		console.log(dataEquiposTorneoPartida);

    		for (let i = 0; i < dataEquiposTorneoPartida.length; i = i + 2) {
    			// una partida tiene 2 equipos por eso, hacemos un for que recorre el json de a pares 
    			let dataMatchAux = {}; // creamos un json que va a tener todos los datos de una partida( sus equipos y su resultado)

    			const respuestaEquipo1 = await fetch(apiURLGetEquipo + dataEquiposTorneoPartida[i].id_equipo); // obtener datos equipo 1 
    			let jsonEquipo1 = await respuestaEquipo1.json();

    			//console.log(jsonEquipo1);//equipo 1  
    			const respuestaEquipo2 = await fetch(apiURLGetEquipo + dataEquiposTorneoPartida[i + 1].id_equipo); // obtener datos equipo 2

    			let jsonEquipo2 = await respuestaEquipo2.json();

    			//console.log(jsonEquipo2);//equipo 2  
    			const respuestaPartida = await fetch(apiURLGetPartida + dataEquiposTorneoPartida[i].id_partida);

    			let jsonPartida = await respuestaPartida.json(); // armamos nuestro json con lo que necesitamos...
    			dataMatchAux.id_partida = jsonPartida.id_partida;
    			dataMatchAux.resultado_partida = jsonPartida.resultado_partida;
    			dataMatchAux.id_equipo1 = jsonEquipo1.id_equipo;
    			dataMatchAux.equipo1 = jsonEquipo1.nombre_equipo;
    			dataMatchAux.equipo2 = jsonEquipo2.nombre_equipo;
    			dataMatchAux.id_equipo2 = jsonEquipo2.id_equipo;
    			dataMatchesAux.push(dataMatchAux);
    		}

    		$$invalidate(1, dataMatches = dataMatchesAux); // svelte no reacciona a push...
    	});

    	async function desinscribirEquipoTorneo(p_idEquipo) {
    		const response = await fetch(apiURLDelEquiTorneo + p_idEquipo + "/" + idTorneo, { method: "DELETE" });

    		//const json = await response.json()
    		//let result = JSON.stringify(json)
    		location.reload();
    	} //console.log(result)

    	async function BorrarPartidaEquipoTorneo(p_idPartida, p_equipo1, p_equipo2) {
    		eliminarEquiTornePartida(p_idPartida, p_equipo1); // eliminar la partida con el equipo 1
    		eliminarEquiTornePartida(p_idPartida, p_equipo2); // eliminar la partida con el equipo 2
    		eliminarPartida(p_idPartida);
    		location.reload();
    	}

    	//console.log(result)
    	async function eliminarEquiTornePartida(p_idPartida, p_idEquipo) {
    		// elimina la relacion equipo torneo partida
    		const response = await fetch(apiURLDelEquiTorneoPartida + p_idEquipo + "/" + idTorneo + "/" + p_idPartida, { method: "DELETE" });

    		const json = await response.json();
    		let result = JSON.stringify(json);
    		console.log(result);
    	}

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$6.warn(`<PerfilTorneo> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("PerfilTorneo", $$slots, []);
    	const click_handler = row => desinscribirEquipoTorneo(row.id_equipo);
    	const click_handler_1 = row => BorrarPartidaEquipoTorneo(row.id_partida, row.id_equipo1, row.id_equipo2);

    	$$self.$$set = $$props => {
    		if ("params" in $$props) $$invalidate(5, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		params,
    		idTorneo,
    		apiURLGetEquisTorneo,
    		apiURLGetEquipo,
    		apiURLGetEquistorneoPartida,
    		apiURLGetPartida,
    		apiURLDelEquiTorneo,
    		apiURLDelPartida,
    		apiURLDelEquiTorneoPartida,
    		dataEquiposTorneo,
    		dataMatches,
    		GetSortOrder,
    		desinscribirEquipoTorneo,
    		BorrarPartidaEquipoTorneo,
    		eliminarPartida,
    		eliminarEquiTornePartida
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(5, params = $$props.params);
    		if ("idTorneo" in $$props) $$invalidate(2, idTorneo = $$props.idTorneo);
    		if ("dataEquiposTorneo" in $$props) $$invalidate(0, dataEquiposTorneo = $$props.dataEquiposTorneo);
    		if ("dataMatches" in $$props) $$invalidate(1, dataMatches = $$props.dataMatches);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		dataEquiposTorneo,
    		dataMatches,
    		idTorneo,
    		desinscribirEquipoTorneo,
    		BorrarPartidaEquipoTorneo,
    		params,
    		click_handler,
    		click_handler_1
    	];
    }

    class PerfilTorneo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { params: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PerfilTorneo",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*params*/ ctx[5] === undefined && !("params" in props)) {
    			console_1$6.warn("<PerfilTorneo> was created without expected prop 'params'");
    		}
    	}

    	get params() {
    		throw new Error("<PerfilTorneo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<PerfilTorneo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\NuevoEquipoTorneo.svelte generated by Svelte v3.24.1 */

    const { console: console_1$7 } = globals;
    const file$f = "src\\NuevoEquipoTorneo.svelte";

    function get_each_context$9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (55:18) {#each dataEquipos as equipo }
    function create_each_block$9(ctx) {
    	let option;
    	let t_value = /*equipo*/ ctx[8].nombre_equipo + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*equipo*/ ctx[8].id_equipo;
    			option.value = option.__value;
    			add_location(option, file$f, 55, 18, 1811);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dataEquipos*/ 1 && t_value !== (t_value = /*equipo*/ ctx[8].nombre_equipo + "")) set_data_dev(t, t_value);

    			if (dirty & /*dataEquipos*/ 1 && option_value_value !== (option_value_value = /*equipo*/ ctx[8].id_equipo)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$9.name,
    		type: "each",
    		source: "(55:18) {#each dataEquipos as equipo }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let body;
    	let div7;
    	let div6;
    	let div5;
    	let div0;
    	let span;
    	let t1;
    	let div4;
    	let div2;
    	let div1;
    	let select;
    	let option;
    	let t3;
    	let label;
    	let t5;
    	let div3;
    	let a;
    	let i;
    	let t7;
    	let mounted;
    	let dispose;
    	let each_value = /*dataEquipos*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$9(get_each_context$9(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			body = element("body");
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			span = element("span");
    			span.textContent = "Inscribir Equipo a Torneo";
    			t1 = space();
    			div4 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			select = element("select");
    			option = element("option");
    			option.textContent = "Equipos";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			label = element("label");
    			label.textContent = "Nombre Equipo";
    			t5 = space();
    			div3 = element("div");
    			a = element("a");
    			i = element("i");
    			i.textContent = "check_circle";
    			t7 = text("Agregar");
    			attr_dev(span, "class", "card-title center ");
    			set_style(span, "color", "#263238 ");
    			set_style(span, "font-size", "2em");
    			set_style(span, "font-weight", "bolder");
    			add_location(span, file$f, 46, 10, 1318);
    			attr_dev(div0, "class", "card-content black-text thick ");
    			add_location(div0, file$f, 45, 8, 1261);
    			option.__value = "";
    			option.value = option.__value;
    			option.disabled = true;
    			option.selected = true;
    			add_location(option, file$f, 53, 18, 1690);
    			attr_dev(select, "class", "browser-default");
    			if (/*selected*/ ctx[1] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[4].call(select));
    			add_location(select, file$f, 52, 16, 1615);
    			attr_dev(label, "class", "active");
    			attr_dev(label, "for", "first_name ");
    			add_location(label, file$f, 58, 16, 1947);
    			attr_dev(div1, "class", "row input-field col s6 offset");
    			add_location(div1, file$f, 51, 12, 1547);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file$f, 50, 10, 1510);
    			attr_dev(i, "class", "material-icons left white-text ");
    			add_location(i, file$f, 62, 132, 2220);
    			set_style(a, "color", "white");
    			attr_dev(a, "class", "waves-effect waves-light btn deep- blue darken-1");
    			add_location(a, file$f, 62, 12, 2100);
    			attr_dev(div3, "class", "container");
    			add_location(div3, file$f, 61, 10, 2061);
    			attr_dev(div4, "class", "card-action");
    			add_location(div4, file$f, 49, 8, 1473);
    			attr_dev(div5, "class", "col s12 m4 l8 card blue-grey lighten-5");
    			add_location(div5, file$f, 44, 6, 1199);
    			attr_dev(div6, "class", "container");
    			add_location(div6, file$f, 43, 4, 1166);
    			attr_dev(div7, "class", "container ");
    			set_style(div7, "padding-top", "10%");
    			add_location(div7, file$f, 42, 2, 1110);
    			set_style(body, "background-image", "url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)");
    			add_location(body, file$f, 41, 0, 975);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div0);
    			append_dev(div0, span);
    			append_dev(div5, t1);
    			append_dev(div5, div4);
    			append_dev(div4, div2);
    			append_dev(div2, div1);
    			append_dev(div1, select);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*selected*/ ctx[1]);
    			append_dev(div1, t3);
    			append_dev(div1, label);
    			append_dev(div4, t5);
    			append_dev(div4, div3);
    			append_dev(div3, a);
    			append_dev(a, i);
    			append_dev(a, t7);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[4]),
    					listen_dev(a, "click", /*click_handler*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dataEquipos*/ 1) {
    				each_value = /*dataEquipos*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$9(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$9(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*selected, dataEquipos*/ 3) {
    				select_option(select, /*selected*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const apiURL1 = "http://127.0.0.1:5000/get_equipos";
    const apiURL2$1 = "http://127.0.0.1:5000/add_equi_torneo";

    function instance$g($$self, $$props, $$invalidate) {
    	let { params } = $$props;
    	let idTorneo = params.ID_Torneo;
    	let dataEquipos = [];
    	let selected;
    	let nombreJugadorNuevo = "";

    	onMount(async function () {
    		const response = await fetch(apiURL1);
    		$$invalidate(0, dataEquipos = await response.json());
    		console.log(dataEquipos);
    	});

    	async function inscribirEquipoTorneo() {
    		const response = await fetch(apiURL2$1, {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				"id_equipo": selected,
    				"id_torneo": idTorneo
    			})
    		});

    		const json = await response.json();
    		let result = JSON.stringify(json);
    		location.href = "/#/PerfilTorneo/" + idTorneo;
    		console.log(result);
    	}

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$7.warn(`<NuevoEquipoTorneo> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("NuevoEquipoTorneo", $$slots, []);

    	function select_change_handler() {
    		selected = select_value(this);
    		$$invalidate(1, selected);
    		$$invalidate(0, dataEquipos);
    	}

    	const click_handler = () => inscribirEquipoTorneo();

    	$$self.$$set = $$props => {
    		if ("params" in $$props) $$invalidate(3, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		apiURL1,
    		apiURL2: apiURL2$1,
    		params,
    		idTorneo,
    		dataEquipos,
    		selected,
    		nombreJugadorNuevo,
    		inscribirEquipoTorneo
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(3, params = $$props.params);
    		if ("idTorneo" in $$props) idTorneo = $$props.idTorneo;
    		if ("dataEquipos" in $$props) $$invalidate(0, dataEquipos = $$props.dataEquipos);
    		if ("selected" in $$props) $$invalidate(1, selected = $$props.selected);
    		if ("nombreJugadorNuevo" in $$props) nombreJugadorNuevo = $$props.nombreJugadorNuevo;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		dataEquipos,
    		selected,
    		inscribirEquipoTorneo,
    		params,
    		select_change_handler,
    		click_handler
    	];
    }

    class NuevoEquipoTorneo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { params: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NuevoEquipoTorneo",
    			options,
    			id: create_fragment$g.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*params*/ ctx[3] === undefined && !("params" in props)) {
    			console_1$7.warn("<NuevoEquipoTorneo> was created without expected prop 'params'");
    		}
    	}

    	get params() {
    		throw new Error("<NuevoEquipoTorneo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<NuevoEquipoTorneo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\NuevoEquipoTorneoPartida.svelte generated by Svelte v3.24.1 */

    const { console: console_1$8 } = globals;
    const file$g = "src\\NuevoEquipoTorneoPartida.svelte";

    function get_each_context$a(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (104:18) {#each dataEquipos as equipo }
    function create_each_block_1$2(ctx) {
    	let option;
    	let t_value = /*equipo*/ ctx[12].nombre_equipo + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*equipo*/ ctx[12].id_equipo;
    			option.value = option.__value;
    			add_location(option, file$g, 104, 18, 3863);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dataEquipos*/ 1 && t_value !== (t_value = /*equipo*/ ctx[12].nombre_equipo + "")) set_data_dev(t, t_value);

    			if (dirty & /*dataEquipos*/ 1 && option_value_value !== (option_value_value = /*equipo*/ ctx[12].id_equipo)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(104:18) {#each dataEquipos as equipo }",
    		ctx
    	});

    	return block;
    }

    // (114:18) {#each dataEquipos as equipo }
    function create_each_block$a(ctx) {
    	let option;
    	let t_value = /*equipo*/ ctx[12].nombre_equipo + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*equipo*/ ctx[12].id_equipo;
    			option.value = option.__value;
    			add_location(option, file$g, 114, 18, 4367);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dataEquipos*/ 1 && t_value !== (t_value = /*equipo*/ ctx[12].nombre_equipo + "")) set_data_dev(t, t_value);

    			if (dirty & /*dataEquipos*/ 1 && option_value_value !== (option_value_value = /*equipo*/ ctx[12].id_equipo)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$a.name,
    		type: "each",
    		source: "(114:18) {#each dataEquipos as equipo }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let body;
    	let div8;
    	let div7;
    	let div6;
    	let div0;
    	let span;
    	let t1;
    	let div5;
    	let div4;
    	let div1;
    	let select0;
    	let option0;
    	let t3;
    	let label0;
    	let t5;
    	let div2;
    	let select1;
    	let option1;
    	let t7;
    	let label1;
    	let t9;
    	let div3;
    	let input;
    	let t10;
    	let label2;
    	let t12;
    	let button;
    	let i;
    	let t14;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*dataEquipos*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	let each_value = /*dataEquipos*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$a(get_each_context$a(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			body = element("body");
    			div8 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			div0 = element("div");
    			span = element("span");
    			span.textContent = "Inserte una partida al torneo";
    			t1 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div1 = element("div");
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "Equipos";

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t3 = space();
    			label0 = element("label");
    			label0.textContent = "Equipo 1";
    			t5 = space();
    			div2 = element("div");
    			select1 = element("select");
    			option1 = element("option");
    			option1.textContent = "Equipos";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t7 = space();
    			label1 = element("label");
    			label1.textContent = "Equipo 2";
    			t9 = space();
    			div3 = element("div");
    			input = element("input");
    			t10 = space();
    			label2 = element("label");
    			label2.textContent = "Resultado";
    			t12 = space();
    			button = element("button");
    			i = element("i");
    			i.textContent = "check_circle";
    			t14 = text("Agregar");
    			attr_dev(span, "class", "card-title center ");
    			set_style(span, "color", "#263238 ");
    			set_style(span, "font-size", "2em");
    			set_style(span, "font-weight", "bolder");
    			add_location(span, file$g, 94, 10, 3355);
    			attr_dev(div0, "class", "card-content black-text thick ");
    			add_location(div0, file$g, 93, 8, 3298);
    			option0.__value = "";
    			option0.value = option0.__value;
    			option0.disabled = true;
    			option0.selected = true;
    			add_location(option0, file$g, 102, 18, 3742);
    			attr_dev(select0, "class", "browser-default");
    			if (/*selectedEquipo1*/ ctx[1] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[6].call(select0));
    			add_location(select0, file$g, 101, 16, 3660);
    			attr_dev(label0, "class", "active");
    			attr_dev(label0, "for", "first_name ");
    			add_location(label0, file$g, 107, 16, 3999);
    			attr_dev(div1, "class", "row input-field col s6 offset");
    			add_location(div1, file$g, 100, 14, 3592);
    			option1.__value = "";
    			option1.value = option1.__value;
    			option1.disabled = true;
    			option1.selected = true;
    			add_location(option1, file$g, 112, 18, 4246);
    			attr_dev(select1, "class", "browser-default");
    			if (/*selectedEquipo2*/ ctx[2] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[7].call(select1));
    			add_location(select1, file$g, 111, 16, 4164);
    			attr_dev(label1, "class", "active");
    			attr_dev(label1, "for", "first_name ");
    			add_location(label1, file$g, 117, 16, 4503);
    			attr_dev(div2, "class", "row input-field col s6 offset");
    			add_location(div2, file$g, 110, 14, 4096);
    			set_style(input, "border-radius", "15px");
    			attr_dev(input, "placeholder", "Por Determinar");
    			attr_dev(input, "id", "first_name");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "white validate black-text");
    			add_location(input, file$g, 121, 16, 4664);
    			attr_dev(label2, "class", "active ");
    			attr_dev(label2, "for", "first_name ");
    			add_location(label2, file$g, 122, 18, 4840);
    			attr_dev(div3, "class", "row input-field col s6 offset ");
    			add_location(div3, file$g, 120, 14, 4602);
    			attr_dev(i, "class", "material-icons left ");
    			add_location(i, file$g, 124, 115, 5038);
    			attr_dev(button, "class", "waves-effect waves-light btn  blue darken-1");
    			add_location(button, file$g, 124, 14, 4937);
    			attr_dev(div4, "class", "container");
    			add_location(div4, file$g, 98, 10, 3551);
    			attr_dev(div5, "class", "card-action");
    			add_location(div5, file$g, 97, 8, 3514);
    			attr_dev(div6, "class", "col s12 m4 l8 card blue-grey lighten-5");
    			add_location(div6, file$g, 92, 6, 3236);
    			attr_dev(div7, "class", "container");
    			add_location(div7, file$g, 91, 4, 3203);
    			attr_dev(div8, "class", "container ");
    			set_style(div8, "padding-top", "10%");
    			add_location(div8, file$g, 90, 2, 3147);
    			set_style(body, "background-image", "url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)");
    			add_location(body, file$g, 89, 0, 3012);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div8);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div6, div0);
    			append_dev(div0, span);
    			append_dev(div6, t1);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div1);
    			append_dev(div1, select0);
    			append_dev(select0, option0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select0, null);
    			}

    			select_option(select0, /*selectedEquipo1*/ ctx[1]);
    			append_dev(div1, t3);
    			append_dev(div1, label0);
    			append_dev(div4, t5);
    			append_dev(div4, div2);
    			append_dev(div2, select1);
    			append_dev(select1, option1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select1, null);
    			}

    			select_option(select1, /*selectedEquipo2*/ ctx[2]);
    			append_dev(div2, t7);
    			append_dev(div2, label1);
    			append_dev(div4, t9);
    			append_dev(div4, div3);
    			append_dev(div3, input);
    			set_input_value(input, /*resultadoPartida*/ ctx[3]);
    			append_dev(div3, t10);
    			append_dev(div3, label2);
    			append_dev(div4, t12);
    			append_dev(div4, button);
    			append_dev(button, i);
    			append_dev(button, t14);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[6]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[7]),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[8]),
    					listen_dev(button, "click", /*click_handler*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dataEquipos*/ 1) {
    				each_value_1 = /*dataEquipos*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*selectedEquipo1, dataEquipos*/ 3) {
    				select_option(select0, /*selectedEquipo1*/ ctx[1]);
    			}

    			if (dirty & /*dataEquipos*/ 1) {
    				each_value = /*dataEquipos*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$a(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$a(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*selectedEquipo2, dataEquipos*/ 5) {
    				select_option(select1, /*selectedEquipo2*/ ctx[2]);
    			}

    			if (dirty & /*resultadoPartida*/ 8 && input.value !== /*resultadoPartida*/ ctx[3]) {
    				set_input_value(input, /*resultadoPartida*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const apiURLGetEquiposTorneo = "http://127.0.0.1:5000/get_equis_torneo/";
    const apiURLGetEquipo$1 = "http://127.0.0.1:5000/get_equipo/";
    const apiURLAddPartida = "http://127.0.0.1:5000/add_partida";
    const apiURLAddEquiTorneoPartida = "http://127.0.0.1:5000/add_equi_torneo_partida";

    function instance$h($$self, $$props, $$invalidate) {
    	let { params } = $$props;
    	let idTorneo = params.ID_Torneo;
    	let dataEquipos = [];
    	let selectedEquipo1 = null;
    	let selectedEquipo2 = null;
    	let resultadoPartida;

    	onMount(async function () {
    		let dataEquiposAux = [];
    		const response = await fetch(apiURLGetEquiposTorneo + idTorneo); // trae los equipos de un torneo
    		let dataEquiposTorneo = await response.json();

    		//console.log(dataEquiposTorneo);
    		//console.log(dataEquiposTorneo.length);
    		for (let i = 0; i < dataEquiposTorneo.length; i++) {
    			const responseEquipo = await fetch(apiURLGetEquipo$1 + dataEquiposTorneo[i].id_equipo); // obtiene los datos de todos los equipos del torneo
    			let jsonEquipo = await responseEquipo.json();
    			dataEquiposAux.push(jsonEquipo); // mete equipo por equipo 
    		}

    		$$invalidate(0, dataEquipos = dataEquiposAux); // svelte no reacciona push.....
    	}); //console.log(dataEquipos);

    	async function insertarPartidaTorneo() {
    		if (selectedEquipo1 != selectedEquipo2 && selectedEquipo1 != null && selectedEquipo2 != null) {
    			const partida = JSON.parse(await crearPartida());

    			// insertamos la partida con sus dos equipos a un torneo, por eso se hace la misma consulta 2 veces
    			const response = await fetch(apiURLAddEquiTorneoPartida, {
    				method: "POST",
    				headers: { "Content-Type": "application/json" },
    				body: JSON.stringify({
    					"id_equipo": selectedEquipo1,
    					"id_torneo": idTorneo,
    					"id_partida": partida.id_partida
    				})
    			});

    			//const json1 = await response.json()
    			const response2 = await fetch(apiURLAddEquiTorneoPartida, {
    				method: "POST",
    				headers: { "Content-Type": "application/json" },
    				body: JSON.stringify({
    					"id_equipo": selectedEquipo2,
    					"id_torneo": idTorneo,
    					"id_partida": partida.id_partida
    				})
    			});

    			//const json2 = await response2.json()
    			//console.log(json1);
    			//console.log(json2);
    			location.href = "/#/PerfilTorneo/" + idTorneo;
    		} else alert("Los equipos no son validos");
    	}

    	async function crearPartida() {
    		console.log(resultadoPartida);

    		const response = await fetch(apiURLAddPartida, {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				"id_partida": null,
    				"resultado_partida": resultadoPartida
    			})
    		});

    		const json = await response.json();

    		//console.log(json);
    		return json;
    	}

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$8.warn(`<NuevoEquipoTorneoPartida> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("NuevoEquipoTorneoPartida", $$slots, []);

    	function select0_change_handler() {
    		selectedEquipo1 = select_value(this);
    		$$invalidate(1, selectedEquipo1);
    		$$invalidate(0, dataEquipos);
    	}

    	function select1_change_handler() {
    		selectedEquipo2 = select_value(this);
    		$$invalidate(2, selectedEquipo2);
    		$$invalidate(0, dataEquipos);
    	}

    	function input_input_handler() {
    		resultadoPartida = this.value;
    		$$invalidate(3, resultadoPartida);
    	}

    	const click_handler = () => insertarPartidaTorneo();

    	$$self.$$set = $$props => {
    		if ("params" in $$props) $$invalidate(5, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		params,
    		apiURLGetEquiposTorneo,
    		apiURLGetEquipo: apiURLGetEquipo$1,
    		apiURLAddPartida,
    		apiURLAddEquiTorneoPartida,
    		idTorneo,
    		dataEquipos,
    		selectedEquipo1,
    		selectedEquipo2,
    		resultadoPartida,
    		insertarPartidaTorneo,
    		crearPartida
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(5, params = $$props.params);
    		if ("idTorneo" in $$props) idTorneo = $$props.idTorneo;
    		if ("dataEquipos" in $$props) $$invalidate(0, dataEquipos = $$props.dataEquipos);
    		if ("selectedEquipo1" in $$props) $$invalidate(1, selectedEquipo1 = $$props.selectedEquipo1);
    		if ("selectedEquipo2" in $$props) $$invalidate(2, selectedEquipo2 = $$props.selectedEquipo2);
    		if ("resultadoPartida" in $$props) $$invalidate(3, resultadoPartida = $$props.resultadoPartida);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		dataEquipos,
    		selectedEquipo1,
    		selectedEquipo2,
    		resultadoPartida,
    		insertarPartidaTorneo,
    		params,
    		select0_change_handler,
    		select1_change_handler,
    		input_input_handler,
    		click_handler
    	];
    }

    class NuevoEquipoTorneoPartida extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { params: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NuevoEquipoTorneoPartida",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*params*/ ctx[5] === undefined && !("params" in props)) {
    			console_1$8.warn("<NuevoEquipoTorneoPartida> was created without expected prop 'params'");
    		}
    	}

    	get params() {
    		throw new Error("<NuevoEquipoTorneoPartida>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<NuevoEquipoTorneoPartida>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\NuevoJugadorEquipo.svelte generated by Svelte v3.24.1 */

    const { console: console_1$9 } = globals;
    const file$h = "src\\NuevoJugadorEquipo.svelte";

    function get_each_context$b(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (60:20) {#each dataJugadores as jugador }
    function create_each_block$b(ctx) {
    	let option;
    	let t_value = /*jugador*/ ctx[8].nombre_jugador + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*jugador*/ ctx[8].id_jugador;
    			option.value = option.__value;
    			add_location(option, file$h, 60, 20, 2650);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dataJugadores*/ 2 && t_value !== (t_value = /*jugador*/ ctx[8].nombre_jugador + "")) set_data_dev(t, t_value);

    			if (dirty & /*dataJugadores*/ 2 && option_value_value !== (option_value_value = /*jugador*/ ctx[8].id_jugador)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$b.name,
    		type: "each",
    		source: "(60:20) {#each dataJugadores as jugador }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let body;
    	let div6;
    	let div5;
    	let div4;
    	let div0;
    	let span0;
    	let t0_value = /*dataEquipo*/ ctx[2].nombre_equipo + "";
    	let t0;
    	let t1;
    	let span1;
    	let t3;
    	let div3;
    	let div2;
    	let div1;
    	let select;
    	let option;
    	let t5;
    	let label;
    	let t7;
    	let a;
    	let i;
    	let t9;
    	let mounted;
    	let dispose;
    	let each_value = /*dataJugadores*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$b(get_each_context$b(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			body = element("body");
    			div6 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span1 = element("span");
    			span1.textContent = "Agregar jugador al equipo:";
    			t3 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			select = element("select");
    			option = element("option");
    			option.textContent = "Jugadores";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			label = element("label");
    			label.textContent = "Nombre Equipo";
    			t7 = space();
    			a = element("a");
    			i = element("i");
    			i.textContent = "check_circle";
    			t9 = text("Agregar");
    			attr_dev(span0, "class", "card-title center ");
    			set_style(span0, "color", "#263238 ");
    			set_style(span0, "font-size", "2em");
    			set_style(span0, "font-weight", "bolder");
    			add_location(span0, file$h, 49, 12, 1979);
    			attr_dev(span1, "class", "card-title center ");
    			set_style(span1, "color", "#263238 ");
    			set_style(span1, "font-size", "2em");
    			set_style(span1, "font-weight", "bolder");
    			add_location(span1, file$h, 50, 12, 2121);
    			attr_dev(div0, "class", "card-content black-text thick ");
    			add_location(div0, file$h, 48, 10, 1920);
    			option.__value = "";
    			option.value = option.__value;
    			option.disabled = true;
    			option.selected = true;
    			add_location(option, file$h, 58, 20, 2520);
    			attr_dev(select, "class", "browser-default");
    			if (/*selected*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[5].call(select));
    			add_location(select, file$h, 57, 18, 2443);
    			attr_dev(label, "class", "active");
    			attr_dev(label, "for", "first_name ");
    			add_location(label, file$h, 63, 18, 2796);
    			attr_dev(div1, "class", "row input-field col s6 offset");
    			add_location(div1, file$h, 56, 14, 2373);
    			attr_dev(i, "class", "material-icons left white-text ");
    			add_location(i, file$h, 65, 135, 3019);
    			set_style(a, "color", "white");
    			attr_dev(a, "class", "waves-effect waves-light btn deep- blue darken-1");
    			add_location(a, file$h, 65, 16, 2900);
    			attr_dev(div2, "class", "container");
    			add_location(div2, file$h, 55, 12, 2334);
    			attr_dev(div3, "class", "card-action");
    			add_location(div3, file$h, 54, 10, 2295);
    			attr_dev(div4, "class", "col s12 m4 l8 card blue-grey lighten-5");
    			add_location(div4, file$h, 47, 8, 1856);
    			attr_dev(div5, "class", "container");
    			add_location(div5, file$h, 46, 6, 1821);
    			attr_dev(div6, "class", "container ");
    			set_style(div6, "padding-top", "10%");
    			add_location(div6, file$h, 45, 4, 1763);
    			set_style(body, "background-image", "url(https://lolstatic-a.akamaihd.net/rso-login-page/2.9.34/assets/riot_desktop_background_2x.jpg)");
    			add_location(body, file$h, 44, 0, 1626);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div0, span0);
    			append_dev(span0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, span1);
    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, select);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*selected*/ ctx[0]);
    			append_dev(div1, t5);
    			append_dev(div1, label);
    			append_dev(div2, t7);
    			append_dev(div2, a);
    			append_dev(a, i);
    			append_dev(a, t9);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[5]),
    					listen_dev(a, "click", /*click_handler*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dataEquipo*/ 4 && t0_value !== (t0_value = /*dataEquipo*/ ctx[2].nombre_equipo + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*dataJugadores*/ 2) {
    				each_value = /*dataJugadores*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$b(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$b(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*selected, dataJugadores*/ 3) {
    				select_option(select, /*selected*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const apiURLAddJugadorEquipo = "http://127.0.0.1:5000/add_equi_juga";
    const apiURLGetEquipo$2 = "http://127.0.0.1:5000/get_equipo/";
    const apiURLGetJugadores$1 = "http://127.0.0.1:5000/get_jugadores";

    function instance$i($$self, $$props, $$invalidate) {
    	let { params } = $$props;
    	let idEquipo = params.ID_Equipo; // para la url de la api
    	let selected;
    	let dataJugadores = []; // estructura que va a almacenar el json de la respuesta de la api
    	let dataEquipo = [];

    	//onMount ejecuta la funcion al principio               <a style="color:white" class="waves-effect waves-light btn deep- blue darken-1" on:click={()=> inscribirEquipoTorneo()}><i class="material-icons left white-text ">check_circle</i>Agregar</a>
    	onMount(async function () {
    		const response = await fetch(apiURLGetEquipo$2 + idEquipo);
    		$$invalidate(2, dataEquipo = await response.json());
    		console.log(dataEquipo);
    	});

    	onMount(async function () {
    		const response = await fetch(apiURLGetJugadores$1);
    		$$invalidate(1, dataJugadores = await response.json());
    		console.log(dataJugadores);
    	});

    	async function agregarJugadorEquipo() {
    		const response = await fetch(apiURLAddJugadorEquipo, {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				"id_equipo": idEquipo,
    				"id_jugador": selected
    			})
    		});

    		const json = await response.json();
    		let result = JSON.stringify(json);
    		location.href = "/#/PerfilEquipo/" + idEquipo;
    		console.log(result);
    	}

    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$9.warn(`<NuevoJugadorEquipo> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("NuevoJugadorEquipo", $$slots, []);

    	function select_change_handler() {
    		selected = select_value(this);
    		$$invalidate(0, selected);
    		$$invalidate(1, dataJugadores);
    	}

    	const click_handler = () => agregarJugadorEquipo();

    	$$self.$$set = $$props => {
    		if ("params" in $$props) $$invalidate(4, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		params,
    		idEquipo,
    		selected,
    		apiURLAddJugadorEquipo,
    		apiURLGetEquipo: apiURLGetEquipo$2,
    		apiURLGetJugadores: apiURLGetJugadores$1,
    		dataJugadores,
    		dataEquipo,
    		agregarJugadorEquipo
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(4, params = $$props.params);
    		if ("idEquipo" in $$props) idEquipo = $$props.idEquipo;
    		if ("selected" in $$props) $$invalidate(0, selected = $$props.selected);
    		if ("dataJugadores" in $$props) $$invalidate(1, dataJugadores = $$props.dataJugadores);
    		if ("dataEquipo" in $$props) $$invalidate(2, dataEquipo = $$props.dataEquipo);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selected,
    		dataJugadores,
    		dataEquipo,
    		agregarJugadorEquipo,
    		params,
    		select_change_handler,
    		click_handler
    	];
    }

    class NuevoJugadorEquipo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { params: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NuevoJugadorEquipo",
    			options,
    			id: create_fragment$i.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*params*/ ctx[4] === undefined && !("params" in props)) {
    			console_1$9.warn("<NuevoJugadorEquipo> was created without expected prop 'params'");
    		}
    	}

    	get params() {
    		throw new Error("<NuevoJugadorEquipo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<NuevoJugadorEquipo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.24.1 */
    const file$i = "src\\App.svelte";

    function create_fragment$j(ctx) {
    	let link0;
    	let link1;
    	let link2;
    	let meta;
    	let t0;
    	let nav;
    	let div;
    	let a0;
    	let i0;
    	let t2;
    	let t3;
    	let ul;
    	let li0;
    	let a1;
    	let t4;
    	let i1;
    	let t6;
    	let li1;
    	let a2;
    	let t7;
    	let i2;
    	let t9;
    	let li2;
    	let a3;
    	let t10;
    	let i3;
    	let t12;
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				routes: {
    					"/": Jugadores,
    					"/EditarJugador/:ID_Jugador": EditarJugador,
    					"/Jugadores": Jugadores,
    					"/NuevoJugador": NuevoJugador,
    					"/EditarTorneo/:ID_Torneo": EditarTorneo,
    					"/EditarPartida/:ID_Partida": EditarPartida,
    					"/EditarEquipo/:ID_Equipo": EditarEquipo,
    					"/Torneos": Torneos,
    					"/Partidas": Partidas,
    					"/Equipos": Equipos,
    					"/NuevoEquipo": NuevoEquipo,
    					"/NuevoTorneo": NuevoTorneo,
    					"/NuevaPartida": NuevaPartida,
    					"/NuevoJugadorEquipo/:ID_Equipo": NuevoJugadorEquipo,
    					"/NuevoEquipoTorneo/:ID_Torneo": NuevoEquipoTorneo,
    					"/NuevoEquipoTorneoPartida/:ID_Torneo": NuevoEquipoTorneoPartida,
    					"/PerfilJugador/:ID_Servidor": PerfilJugador,
    					"/PerfilEquipo/:ID_Equipo": PerfilEquipo,
    					"/PerfilTorneo/:ID_torneo": PerfilTorneo
    				}
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			link1 = element("link");
    			link2 = element("link");
    			meta = element("meta");
    			t0 = space();
    			nav = element("nav");
    			div = element("div");
    			a0 = element("a");
    			i0 = element("i");
    			i0.textContent = "videogame_asset";
    			t2 = text("Tournament Manager");
    			t3 = space();
    			ul = element("ul");
    			li0 = element("li");
    			a1 = element("a");
    			t4 = text("Jugadores ");
    			i1 = element("i");
    			i1.textContent = "person_outline";
    			t6 = space();
    			li1 = element("li");
    			a2 = element("a");
    			t7 = text("Torneos ");
    			i2 = element("i");
    			i2.textContent = "emoji_events";
    			t9 = space();
    			li2 = element("li");
    			a3 = element("a");
    			t10 = text("Equipos ");
    			i3 = element("i");
    			i3.textContent = "groups";
    			t12 = space();
    			create_component(router.$$.fragment);
    			attr_dev(link0, "href", "https://fonts.googleapis.com/icon?family=Material+Icons");
    			attr_dev(link0, "rel", "stylesheet");
    			add_location(link0, file$i, 28, 2, 1169);
    			attr_dev(link1, "type", "text/css");
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "href", "css/materialize.min.css");
    			attr_dev(link1, "media", "screen,projection");
    			add_location(link1, file$i, 30, 2, 1290);
    			attr_dev(link2, "rel", "stylesheet");
    			attr_dev(link2, "href", "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css");
    			add_location(link2, file$i, 31, 2, 1391);
    			attr_dev(meta, "name", "viewport");
    			attr_dev(meta, "content", "width=device-width, initial-scale=1.0");
    			add_location(meta, file$i, 33, 2, 1563);
    			attr_dev(i0, "class", "material-icons");
    			add_location(i0, file$i, 41, 42, 1745);
    			attr_dev(a0, "href", "#!");
    			attr_dev(a0, "class", "brand-logo large");
    			add_location(a0, file$i, 41, 4, 1707);
    			attr_dev(i1, "class", "material-icons right white-text");
    			add_location(i1, file$i, 43, 63, 1920);
    			attr_dev(a1, "href", "/#/Jugadores");
    			set_style(a1, "color", "white");
    			add_location(a1, file$i, 43, 10, 1867);
    			add_location(li0, file$i, 43, 6, 1863);
    			attr_dev(i2, "class", "material-icons right white-text");
    			add_location(i2, file$i, 44, 59, 2050);
    			attr_dev(a2, "href", "/#/Torneos");
    			set_style(a2, "color", "white");
    			add_location(a2, file$i, 44, 10, 2001);
    			add_location(li1, file$i, 44, 6, 1997);
    			attr_dev(i3, "class", "material-icons right white-text");
    			add_location(i3, file$i, 45, 59, 2178);
    			attr_dev(a3, "href", "/#/Equipos");
    			set_style(a3, "color", "white");
    			add_location(a3, file$i, 45, 10, 2129);
    			add_location(li2, file$i, 45, 6, 2125);
    			attr_dev(ul, "class", "right hide-on-med-and-down");
    			add_location(ul, file$i, 42, 4, 1817);
    			attr_dev(div, "class", "nav-wrapper  blue darken-1");
    			add_location(div, file$i, 40, 2, 1662);
    			add_location(nav, file$i, 39, 0, 1654);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link0);
    			append_dev(document.head, link1);
    			append_dev(document.head, link2);
    			append_dev(document.head, meta);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div);
    			append_dev(div, a0);
    			append_dev(a0, i0);
    			append_dev(a0, t2);
    			append_dev(div, t3);
    			append_dev(div, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a1);
    			append_dev(a1, t4);
    			append_dev(a1, i1);
    			append_dev(ul, t6);
    			append_dev(ul, li1);
    			append_dev(li1, a2);
    			append_dev(a2, t7);
    			append_dev(a2, i2);
    			append_dev(ul, t9);
    			append_dev(ul, li2);
    			append_dev(li2, a3);
    			append_dev(a3, t10);
    			append_dev(a3, i3);
    			insert_dev(target, t12, anchor);
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link0);
    			detach_dev(link1);
    			detach_dev(link2);
    			detach_dev(meta);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(nav);
    			if (detaching) detach_dev(t12);
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		Router,
    		location: location$1,
    		link,
    		Jugadores,
    		Torneos,
    		Partidas,
    		Equipos,
    		EditarJugador,
    		EditarTorneo,
    		EditarPartida,
    		EditarEquipo,
    		NuevoJugador,
    		NuevoEquipo,
    		NuevoTorneo,
    		NuevaPartida,
    		PerfilJugador,
    		PerfilEquipo,
    		PerfilTorneo,
    		NuevoEquipoTorneo,
    		NuevoEquipoTorneoPartida,
    		NuevoJugadorEquipo
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
