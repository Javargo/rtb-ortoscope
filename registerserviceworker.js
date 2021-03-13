//*********************************************************************
//REGISTER SERVICE WORKER
//*********************************************************************

if('serviceWorker' in navigator)
{
  navigator.serviceWorker
           .register("sw.js")
           .then(function() { console.log("Service Worker Registered"); });
}
else
{
	console.log("Service Worker is not supported by the browser");
}
