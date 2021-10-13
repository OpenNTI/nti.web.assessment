import React, { useContext } from 'react';
import PropTypes from 'prop-types';

const Context = React.createContext();

QuestionSetSubmittingContext.useContext = () => useContext(Context);
QuestionSetSubmittingContext.propTypes = {
	children: PropTypes.any,
};
export default function QuestionSetSubmittingContext({ children }) {
	return <Context.Provider value={{}}>{children}</Context.Provider>;
}
