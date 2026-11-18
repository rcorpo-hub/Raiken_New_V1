import 'server-only';
import {cache} from 'react';
import catalog from './form-catalog.json';
import {requireAdmin} from './access';
import {HttpError} from './http';
import {serviceForCategory,type SubmissionFormOption} from './submission-categories';

export function registeredFormService(form:{slug:string;directory_category:string}){
 // Existing forms use the same catalog grouping as the public directory.
 // Newly managed forms use the category selected by their author.
 const category=catalog.find(item=>item.slug===form.slug)?.category||form.directory_category;
 return serviceForCategory(category);
}
export const submissionFormOptions=cache(async():Promise<SubmissionFormOption[]>=>{
 const {db}=await requireAdmin('submissions.read');
 const {data,error}=await db.from('forms').select('id,title,slug,directory_category').order('title');
 if(error)throw new HttpError(503,'Form categories could not be loaded.');
 return (data||[]).map(form=>({id:form.id,title:form.title,service:registeredFormService(form)}));
});
