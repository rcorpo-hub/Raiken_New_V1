import {answerFields,answerText,buildAnswerRows,readableField,type AnswerField} from '@/lib/workspace/submission-answers';

function Value({value,field,labels,depth=0}:{value:unknown;field?:AnswerField;labels:Map<string,AnswerField>;depth?:number}){
 const text=answerText(value,field);if(text!==null)return <span className={text==='Not provided'?'admin-answer-missing':'admin-answer-value'}>{text}</span>;
 if(depth>=8)return <span>Additional nested information</span>;
 if(Array.isArray(value))return <ol className="admin-answer-repeat">{value.map((item,index)=><li key={index}><Value value={item} field={field} labels={labels} depth={depth+1}/></li>)}</ol>;
 const entries=Object.entries(value as Record<string,unknown>);
 if(!entries.length)return <span className="admin-answer-missing">Not provided</span>;
 return <dl className="admin-answer-object">{entries.map(([key,item])=><div key={key}><dt>{labels.get(key)?.label||readableField(key)}</dt><dd><Value value={item} field={labels.get(key)} labels={labels} depth={depth+1}/></dd></div>)}</dl>;
}
export default function SubmissionAnswers({answers,schema,contact,caption='Submitted form answers'}:{answers:Record<string,unknown>;schema?:unknown;contact?:Record<string,unknown>;caption?:string}){
 const rows=buildAnswerRows(answers,schema,contact);const labels=new Map(answerFields(schema).map(field=>[field.key,field]));
 return <div className="admin-answer-table-wrap"><table className="admin-answer-table"><caption className="sr-only">{caption}</caption><thead><tr><th scope="col">Field</th><th scope="col">Value</th></tr></thead><tbody>{rows.map(row=><tr key={row.key}><th scope="row">{row.label}</th><td><Value value={row.value} field={row} labels={labels}/></td></tr>)}</tbody></table>{!rows.length&&<p className="admin-muted">No answers were saved for this form.</p>}</div>;
}
