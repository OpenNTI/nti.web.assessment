import {InputTypes} from '../../../question';

import Button from './Button';
import NewQuestionBlock from './NewQuestionBlock';
import QuestionRefBlock from './QuestionRefBlock';

const {Types} = InputTypes;

export default [
	{
		handlesBlock: NewQuestionBlock.handlesBlock,
		component: NewQuestionBlock,
		editable: false
	},
	{
		handlesBlock: QuestionRefBlock.handlesBlock,
		component: QuestionRefBlock,
		editable: false
	},
	...Types
		.filter(type => Boolean(type.Label))
		.map((type) => ({
			Button: Button.Build(type),
			type: type.type
		}))
];
