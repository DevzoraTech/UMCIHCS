type StoredJson<T>={data:T|null;etag?:string};
const storageKey=()=>process.env.PORTAL_STORAGE_KEY??"";
const storageUrl=()=>{const base=process.env.URL??process.env.BETTER_AUTH_URL;if(!base)throw new Error("The portal storage endpoint is not configured.");return new URL("/api/internal/portal-storage",base).toString();};

async function call(body:BodyInit,headers:HeadersInit={}){const key=storageKey();if(!key)throw new Error("The portal storage endpoint is not configured.");const response=await fetch(storageUrl(),{method:"POST",headers:{"x-umcihcs-portal-key":key,...headers},body,cache:"no-store"});if(!response.ok)throw new Error("The portal storage service is unavailable.");return response;}

export async function readPortalJson<T>(store:string,key:string):Promise<StoredJson<T>>{const response=await call(JSON.stringify({action:"read-json",store,key}),{"Content-Type":"application/json"});return response.json() as Promise<StoredJson<T>>;}
export async function writePortalJson(store:string,key:string,data:unknown,options:{etag?:string;onlyIfNew?:boolean}={}){const response=await call(JSON.stringify({action:"write-json",store,key,data,...options}),{"Content-Type":"application/json"});return response.json() as Promise<{modified:boolean;etag?:string}>;}
export async function uploadPortalDocument(key:string,file:File,metadata:{name:string;type:string;reference:string}){const form=new FormData();form.set("action","write-document");form.set("key",key);form.set("metadata",JSON.stringify(metadata));form.set("file",file);return call(form);}
export async function downloadPortalDocument(key:string){return call(JSON.stringify({action:"read-document",key}),{"Content-Type":"application/json"});}
