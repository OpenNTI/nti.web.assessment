import {InputTypes} from '../../../question';

import Button from './Button';
import NewQuestionBlock from './NewQuestionBlock';
import QuestionRefBlock from './QuestionRefBlock';


const Types = [
	InputTypes.MultipleChoice,
	InputTypes.MultipleAnswer,
	InputTypes.Ordering,
	InputTypes.ModeledContent,
	InputTypes.FreeResponse
];

export default [
	{
		handlesBlock: NewQuestionBlock.handlesBlock,
		component: NewQuestionBlock,
		editable: false,
		className: NewQuestionBlock.className
	},
	{
		handlesBlock: QuestionRefBlock.handlesBlock,
		component: QuestionRefBlock,
		editable: false,
		className: QuestionRefBlock.className
	},
	...Types
		.filter(type => Boolean(type.Label))
		.map((type) => ({
			Button: Button.Build(type),
			group: Button.group,
			type: type.type
		}))
];
