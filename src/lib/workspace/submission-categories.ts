import {FORM_SERVICES,categoriesForService,type FormService} from '@/components/public/form-services';

export const submissionServiceIds=['personal-tax','business-accounting','conveyancing','general'] as const;
export type SubmissionService=typeof submissionServiceIds[number];
export type SubmissionFormOption={id:string;title:string;service:SubmissionService};
export const submissionServices=[
 ...Object.entries(FORM_SERVICES).map(([id,service])=>({id:id as SubmissionService,label:service.label})),
 {id:'general' as const,label:'General enquiries'},
];
export function serviceForCategory(category:string):SubmissionService{
 for(const service of Object.keys(FORM_SERVICES) as FormService[])if(categoriesForService(service).includes(category))return service;
 return 'general';
}
export function submissionServiceLabel(service:SubmissionService){return submissionServices.find(item=>item.id===service)!.label;}
