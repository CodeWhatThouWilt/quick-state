class QuickState {
    constructor(stateName, initialState = {}) {
        this.stateName = stateName;
        this.initialState = initialState;
        this.actions = {};
        this.reducer = (state = this.initialState, action) => {
            const caseFunction = this.actions[action.type];

            if (caseFunction) return caseFunction(state, action);
            return state;
        };
    }

    createAction(type, cb) {
        /**
         * @param {type} string - The string associated with the action such as 'users/createUser'
         * @param {function} cb - The callback function to be executed when the action is passed to the reducer. Should take in two parameters, first state then action.
         * @returns {function} Returns a function that accepts key value pairs. Can later be passed into a thunk.
         */
        this.actions[type] = cb;
        return (payload) => ({
            type,
            payload,
        });
    }

    dynamicThunk(cb) {
        /**
         * @param {function} cb - Callback function that should return an options object:
         * action - Uninvoked action
         * url - the url to be used in the fetch request (dynamic parts of url should be included in callback params)
         * method - the request method as a string
         * payload - the payload to be sent in the body (should also be included in callback param)
         * actionArgs - optional. Used if you do not want the response body fed directly into the action
         */
        return (payloadForCb, ...params) =>
            async (dispatch) => {
                const { method, action, payload, url, actionArgs } = cb(
                    payloadForCb,
                    ...params
                );

                let fetchOptions = {};

                if (method && method.toUpperCase() !== "GET") {
                    fetchOptions = {
                        method,
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    };
                }

                const res = await fetch(url, fetchOptions);

                if (res.ok) {
                    const data = await res.json();
                    dispatch(action(actionArgs || data));
                    return data;
                }
                return res;
            };
    }
}

export default QuickState;
