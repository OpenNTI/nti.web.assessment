import '@nti/style-common/variables.css';
import '@nti/style-common/all.scss';
import {addFeatureCheckClasses} from '@nti/lib-dom';

addFeatureCheckClasses();

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
}
