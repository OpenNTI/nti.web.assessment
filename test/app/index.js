import React from 'react';
import ReactDOM from 'react-dom';

import {Placeholder} from '../../src';

window.$AppConfig = window.$AppConfig || {server: '/dataserver2/'};

function Test () {
	return (
		<Placeholder />
	);
}

ReactDOM.render(
	<Test />,
	document.getElementById('content')
);
