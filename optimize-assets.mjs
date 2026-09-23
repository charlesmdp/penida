import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const original = JSON.parse(fs.readFileSync('source/assets.json'));
fs.mkdirSync('dist/assets',{recursive:true});
const optimized=[];
for(const asset of original){
 const input=path.join('source/media',path.basename(asset.local));
 if(asset.local.endsWith('.svg')){fs.copyFileSync(input,'dist'+asset.local);optimized.push({...asset});continue;}
 const meta=await sharp(input).metadata();
 const isLogo=asset.url.endsWith('/penidalogo.png');
 const isIcon=/icon\/|AM.png|EOE.png/.test(asset.url);
 const isPortrait=/cloudinary|leo-ai/.test(asset.url);
 const maxWidth=isLogo?640:isPortrait?400:isIcon?768:1200;
 if(asset.url.endsWith('/Artboard.png')){fs.copyFileSync(input,'dist'+asset.local);optimized.push({...asset,width:meta.width,height:meta.height});continue;}
 const widths=[...new Set([isPortrait?200:isLogo?320:480, Math.min(maxWidth,meta.width)].map(w=>Math.min(w,meta.width)))].sort((a,b)=>a-b);
 const variants=[];
 for(const width of widths){
  const file='/assets/'+path.basename(asset.local,path.extname(asset.local))+'-'+width+'.webp';
  await sharp(input).rotate().resize({width,withoutEnlargement:true}).webp({quality:isLogo?95:86,effort:5}).toFile('dist'+file);
  variants.push({file,width,bytes:fs.statSync('dist'+file).size});
 }
 const largest=variants.at(-1);
 optimized.push({...asset,local:largest.file,originalLocal:asset.local,width:meta.width,height:meta.height,variants,bytes:largest.bytes});
}
fs.writeFileSync('source/optimized-assets.json',JSON.stringify(optimized,null,2)+'\n');
const before=original.reduce((n,a)=>n+a.bytes,0),after=optimized.reduce((n,a)=>n+a.bytes,0);
console.log(`Images: ${before} → ${after} bytes at largest responsive size (${Math.round(100-after/before*100)}% saved).`);
