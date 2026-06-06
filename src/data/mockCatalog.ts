const assetFromPublic=(p:string):string=>`${import.meta.env.BASE_URL}${p.replace(/^\/+/, '')}`;
export const photoAConfirmer=assetFromPublic('vendors/_fallback/photo-a-confirmer.svg');
export interface LocalProduct{ id:string; name:string; vendor:string; price:number; image?:string; category:string; description?:string; zone?:string; available?:boolean; featured?:boolean; allergens?:string; ingredients?:string }
export type Category={id:string;label:string;description:string};
export const mockCategories:Category[]=[
{id:'plats',label:'Plats',description:'Plats créoles et locaux.'},
{id:'snacking',label:'Snacking',description:'Repas rapides et snacks locaux