import React, { useContext } from 'react';
import PropTypes from 'prop-types';

const Context = React.createContext();

QuestionSetEditingContext.useContext = () => useContext(Context);
QuestionSetEditingContext.propTypes = {
	noSolutions: PropTypes.bool,
	children: PropTypes.any,
};
export default function QuestionSetEditingContext({ noSolutions, children }) {
	return (
		<Context.Provider value={{ noSolutions }}>{children}</Context.Provider>
	);
}
