export function getApplicant(data:Record<string,unknown>){
  const entries=Object.entries(data).filter((entry):entry is [string,string]=>typeof entry[1]==='string');
  const get=(keys:string[])=>{for(const key of keys){const found=entries.find(([name,value])=>name.replace(/[^a-z0-9]/gi,'').toLowerCase()===key&&value.trim());if(found)return found[1].trim();}return '';};
  const first=get(['firstname','firstgivenname','settlorfirstname','directorsfirstname']);
  const last=get(['lastname','surnameorfamilyname','settlorlastname']);
  return {
    name:([first,last].filter(Boolean).join(' ')||get(['name','fullname','nameofapplicant','contactperson','companyname','nameofthecompany','trustname','nameoftrust','vendornames','accountname','purchasername','vendorname'])),
    email:get(['email','emailaddress','vendorsemail','companysemail','purchaseremail']),
    phone:get(['phone','phonenumber','contactno','mobile','mobno','vendorsmobile','companyscontactnumber']),
  };
}
