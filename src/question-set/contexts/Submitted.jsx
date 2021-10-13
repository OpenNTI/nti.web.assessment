import React, { useContext } from 'react';
import PropTypes from 'prop-types';

const Context = React.createContext();

QuestionSetSubmittedContext.useContext = () => useContext(Context);
QuestionSetSubmittedContext.propTypes = {
	children: PropTypes.any,
};
export default function QuestionSetSubmittedContext({ children }) {
	return <Context.Provider value={{}}>{children}</Context.Provider>;
}
