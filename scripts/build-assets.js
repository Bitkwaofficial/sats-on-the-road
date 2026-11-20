const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const {minify}=require('terser');
const {transform}=require('lightningcss');

module.exports=async function buildAssets(root){
  const folder=path.join(root,'assets','compiled');
  fs.mkdirSync(folder,{recursive:true});
  const files=['styles.css','nigeria.css','i18n.js','app.js','price-ticker.js','converter.js','share.js','geyser.js','waitlist.js','wall-stories.js','wall.js','nigeria.js'];
  const map={};
  for(const file of files){
    const source=fs.readFileSync(path.join(root,file));
    const code=file.endsWith('.css')
      ? transform({filename:file,code:source,minify:true}).code
      : Buffer.from((await minify(source.toString(),{format:{comments:false}})).code);
    const hash=crypto.createHash('sha256').update(code).digest('hex').slice(0,12);
    const parsed=path.parse(file),name=parsed.name+'.'+hash+parsed.ext;
    fs.writeFileSync(path.join(folder,name),code);
    map[file]='/assets/compiled/'+name;
  }
  // Remove only obsolete generated hashes inside this exact output directory.
  const keep=new Set(Object.values(map).map(url=>path.basename(url)));
  for(const name of fs.readdirSync(folder)){
    const target=path.resolve(folder,name);
    if(path.dirname(target)===path.resolve(folder) && /^[a-z-]+\.[a-f0-9]{12}\.(js|css)$/.test(name) && !keep.has(name)) fs.unlinkSync(target);
  }
  return map;
};
