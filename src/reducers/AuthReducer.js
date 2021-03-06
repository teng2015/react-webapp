const defaultState = {
	user: null,
	token: null,
	isLoggedIn: false
};

export default function authReducer(state = defaultState, action) {
	switch(action.type) {
		case 'AUTH_LOAD':
			return {
				...state,
				user: action.data.user,
				token: action.data.token,
				isLoggedIn: true
			};
		default:
			return state;
	}
}
