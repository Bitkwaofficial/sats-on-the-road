const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const pages=JSON.parse(read('src/pages.json')).pages;
test('only canonical public pages are advertised for crawling',()=>{
  const sitemap=read('sitemap.xml');
  assert(!sitemap.includes('<lastmod>'), 'do not claim all content changed today');
  assert(!sitemap.includes('lang=fr'), 'client-only translation is not an independent canonical page');
  assert(!sitemap.includes('/404')&&!sitemap.includes('/wall-admin'));
  assert(read('404.html').includes('noindex, follow'));
  for(const p of pages.filter(p=>p.sitemap!==false)){
    const html=read(p.out);
    assert(sitemap.includes('https://satsontheroad.africa'+p.path));
    assert(html.includes(`rel="canonical" href="https://satsontheroad.africa${p.path}"`));
    assert(!html.includes('noindex'),p.id);
    assert.equal((html.match(/<h1[ >]/g)||[]).length,1,p.id);
    for(const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(m[1]);
  }
});
test('CSS and scripts use compressed immutable assets and page-specific loading',()=>{
  for(const p of pages){
    const html=read(p.out);
    for(const m of html.matchAll(/<script([^>]+)src="([^"]+)"/g)){
      if(m[2].startsWith('/_vercel'))continue;
      assert(m[1].includes('defer'),p.id+' deferred script');
      assert.match(m[2],/^\/assets\/compiled\/.+\.[a-f0-9]{12}\.js$/);
      assert(fs.existsSync(path.join(root,m[2])));
      if(p.id!=='fuel') assert(!/\/(converter|share|geyser)\./.test(m[2]));
    }
    assert.match(html,/href="\/assets\/compiled\/styles\.[a-f0-9]{12}\.css"/);
  }
  for(const name of ['converter','share','geyser']) assert(read('fuel.html').includes('/'+name+'.'));
});
test('hero uses a smaller image and image dimensions prevent layout shifts',()=>{
  const html=read('index.html');
  assert.match(html,/src="\/assets\/optimized\/sotr-car\.[a-f0-9]{12}\.webp"/);
  assert(html.includes('fetchpriority="high"'));
  for(const p of pages) for(const m of read(p.out).matchAll(/<img\b[^>]*src="[^"]+"[^>]*>/g)){
    assert(/width="\d+"/.test(m[0])&&/height="\d+"/.test(m[0]),p.id+' image dimensions');
  }
});
