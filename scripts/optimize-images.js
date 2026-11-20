// Reproducible derivative images; originals and payment QR codes are preserved.
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const sharp=require('sharp');
const root=path.join(__dirname,'..');
const output=path.join(root,'assets','optimized');
fs.mkdirSync(output,{recursive:true});
async function main(){
  const manifest={};
  let originalBytes=0,optimizedBytes=0;
  async function walk(directory){
    for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
      if(['optimized','compiled'].includes(entry.name)) continue;
      const file=path.join(directory,entry.name);
      if(entry.isDirectory()){await walk(file);continue;}
      if(!/\.(png|jpe?g)$/i.test(entry.name)) continue;
      const key=path.relative(root,file).replaceAll('\\','/');
      const bytes=fs.readFileSync(file),meta=await sharp(bytes).metadata();
      const item={src:'/'+key,width:meta.width,height:meta.height,originalBytes:bytes.length,bytes:bytes.length};
      // Social preview formats and scannable payment images stay untouched.
      if(!/qr|favicon|apple-touch|og-image/i.test(entry.name)){
        const webp=await sharp(bytes).webp({quality:78,effort:6,lossless:meta.format==='png'}).toBuffer();
        if(webp.length<bytes.length){
          const hash=crypto.createHash('sha256').update(webp).digest('hex').slice(0,12);
          const name=path.parse(entry.name).name+'.'+hash+'.webp';
          fs.writeFileSync(path.join(output,name),webp);
          item.src='/assets/optimized/'+name;item.bytes=webp.length;
        }
      }
      originalBytes+=bytes.length;optimizedBytes+=item.bytes;manifest[key]=item;
    }
  }
  await walk(path.join(root,'assets'));
  fs.writeFileSync(path.join(root,'src','image-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(JSON.stringify({images:Object.keys(manifest).length,originalBytes,optimizedBytes,savedBytes:originalBytes-optimizedBytes},null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
