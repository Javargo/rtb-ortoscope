self.addEventListener('install', function(e) {
 e.waitUntil(
   caches.open('application-components').then(function(cache) {
       console.log("Service Worker Install Event");
     return cache.addAll([
       /*'/cofill/',
       '/cofill/index.html',
       '/cofill/fu.js',
       '/cofill/cml.css',
       '/cofill/data_fields.xml',
       '/cofill/make_ui.xsl',
       '/cofill/subco_contract_template.xsl',
       '/cofill/icons/icon-32.png'*/
     ]);
   })
 );
});

self.addEventListener('fetch', function(e)
{
 console.log("Fetch 3"); 
 console.log(e.request.headers);
 const saveURL="https://javargo.github.io/rtb-ortoscope/echo";
  if(e.request.url.search(saveURL)==0)
  {
    //console.log("Speciális ág");
   const right=e.request.url.substring(saveURL.length+1);
   const newHeaders = new Headers();
   newHeaders.append('Content-Type', 'application/xml');
   newHeaders.append('Content-Disposition', 'attachment; filename="data.xml"');
   e.respondWith(new Response(new Blob([decodeURI(right)], {type : 'application/xml'}), {status: 200, readyState: 4, headers: newHeaders}));   
  }
  else
  {
    //console.log("Normál ág");
    e.respondWith(caches.match(e.request).then(function(response)
    {
      return response || fetch(e.request);
    }));
  }
});
