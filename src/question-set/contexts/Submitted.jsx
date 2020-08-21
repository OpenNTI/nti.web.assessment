import React from 'react';
import PropTypes from 'prop-types';

const Context = React.createContext();

QuestionSetSubmittedContext.useContext = () => React.useContext(Context);
QuestionSetSubmittedContext.propTypes = {
	children: PropTypes.any
};
export default function QuestionSetSubmittedContext ({children}) {
	return (
		<Context.Provider value={{}}>
			{children}
		</Context.Provider>
	);
}
