import * as runtime from 'react/jsx-runtime';
import assets from './optimized-assets.json' with {type:'json'};
const byURL=new Map(assets.map(a=>[a.url,a]));
function propsFor(type,props){
 if(type!=='img'||!props?.src)return props;
 const asset=byURL.get(props.src);
 if(!asset)return props;
 const isLogo=asset.url.endsWith('/penidalogo.png');
 const isHero=asset.local.endsWith('.svg');
 const isPortrait=/cloudinary|leo-ai/.test(asset.url);
 return {...props,style:{...props.style,...(isLogo?{width:'auto'}:{})},src:asset.local,width:props.width||asset.width,height:props.height||asset.height,
   ...(asset.variants?{srcSet:asset.variants.map(v=>`${v.file} ${v.width}w`).join(', '),sizes:isLogo?'150px':isPortrait?'(max-width: 640px) 160px, 200px':'(max-width: 767px) calc(100vw - 32px), (max-width: 1023px) 45vw, 400px'}:{}),
   decoding:'async',loading:isLogo||isHero?'eager':'lazy'};
}
export const i={...runtime,jsx:(type,props,key)=>runtime.jsx(type,propsFor(type,props),key),jsxs:(type,props,key)=>runtime.jsxs(type,propsFor(type,props),key)};
