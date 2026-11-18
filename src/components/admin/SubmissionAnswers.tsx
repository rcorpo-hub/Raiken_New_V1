import {answerFields,answerText,buildAnswerRows,isMissingAnswer,readableField,type AnswerField,type AnswerRow} from '@/lib/workspace/submission-answers';

function NestedValue({value,field,labels,depth=0}:{value:unknown;field?:AnswerField;labels:Map<string,AnswerField>;depth?:number}){
 const text=answerText(value,field);
 if(text!==null)return <span className={isMissingAnswer(value)?'admin-answer-missing':'admin-answer-value'}>{text}</span>;
 if(depth>=8)return <span>Additional nested information</span>;
 if(Array.isArray(value))return <ol className="admin-answer-repeat">{value.map((item,index)=><li key={index}><NestedValue value={item} field={field} labels={labels} depth={depth+1}/></li>)}</ol>;
 const entries=Object.entries(value as Record<string,unknown>);
 if(!entries.length)return <span className="admin-answer-missing">Not provided</span>;
 return <dl className="admin-answer-object">{entries.map(([key,item])=><div key={key}><dt>{labels.get(key)?.label||readableField(key)}</dt><dd><NestedValue value={item} field={labels.get(key)} labels={labels} depth={depth+1}/></dd></div>)}</dl>;
}

function CompletedField({row,id,labels}:{row:AnswerRow;id:string;labels:Map<string,AnswerField>}){
 const text=answerText(row.value,row);const missing=isMissingAnswer(row.value);
 const multiline=row.type==='textarea'||(text!==null&&(text.includes('\n')||text.length>110));
 const wide=multiline||text===null;
 return <div className={`admin-completed-field${wide?' admin-completed-field-wide':''}`} data-field-key={row.key}>
  <label id={id+'-label'} htmlFor={text!==null?id:undefined}>{row.label}</label>
  {typeof row.value==='boolean'?<div className="admin-completed-checkbox"><input id={id} type="checkbox" checked={row.value} disabled/><span>{row.value?'Yes':'No'}</span></div>:
   text===null?<div className="admin-completed-complex" aria-labelledby={id+'-label'}><NestedValue value={row.value} field={row} labels={labels}/></div>:
   multiline?<textarea id={id} readOnly value={missing?'':text} placeholder={missing?'Not provided':undefined} rows={Math.min(16,Math.max(3,(text.match(/\n/g)?.length||0)+Math.ceil(text.length/72)))} className={missing?'admin-completed-missing':undefined}/>:
   <input id={id} type="text" readOnly value={missing?'':text} placeholder={missing?'Not provided':undefined} className={missing?'admin-completed-missing':undefined}/>
  }
 </div>;
}

export default function SubmissionAnswers({answers,schema,contact,caption='Submitted form answers',idPrefix='submitted-form'}:{answers:Record<string,unknown>;schema?:unknown;contact?:Record<string,unknown>;caption?:string;idPrefix?:string}){
 const rows=buildAnswerRows(answers,schema,contact);const fields=answerFields(schema);const labels=new Map(fields.map(field=>[field.key,field]));
 const contactRows=rows.filter(row=>row.key.startsWith('@contact.'));
 const detailRows=rows.filter(row=>!row.key.startsWith('@contact.')&&(!fields.length||labels.has(row.key)));
 const additionalRows=fields.length?rows.filter(row=>!row.key.startsWith('@contact.')&&!labels.has(row.key)):[];
 const groups=[{key:'contact',title:'Your contact details',rows:contactRows},{key:'details',title:'Form details',rows:detailRows},{key:'additional',title:'Additional submitted information',rows:additionalRows}].filter(group=>group.rows.length);
 return <div className="admin-completed-form" role="group" aria-label={caption}>
  {groups.map(group=><fieldset key={group.key} className="admin-completed-section"><legend>{group.title}</legend><div className="admin-completed-grid">{group.rows.map((row,index)=><CompletedField key={row.key} row={row} id={`${idPrefix}-${group.key}-${index}`} labels={labels}/>)}</div></fieldset>)}
  {!rows.length&&<p className="admin-muted">No answers were saved for this form.</p>}
 </div>;
}
