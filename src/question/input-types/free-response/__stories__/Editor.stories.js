import React from 'react';

import Editor from '../Editor';
import {Data} from '../utils';

export default {
	title: 'Questions/Input Types/Free Response/Editor',
	component: Editor,
};

export const Solution = () => (<Editor part={Data.generateBlankPart({})} />);
export const NoSolutions = () => (<Editor part={Data.generateBlankPart({noSolutions: true})} />);
