
import Editor from '../Editor';

export default {
	title: 'Questions/Input Types/Free Response/Editor',
	component: Editor,
};

export const Solution = () => <Editor />;
export const NoSolutions = () => <Editor noSolutions />;
