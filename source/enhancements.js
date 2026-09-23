// User-provided Orka installation, loaded once on every page.
window.ORKA_APP_ID="677985e822ee3fdf7f2a2366";
(function(w,d){if(!w.Orka){var o=w.Orka={_q:[]};["load","update","reset","toggle","show","hide","showWidget","hideWidget","destroy","on","off","track"].forEach(function(m){o[m]=function(){o._q.push([m,[].slice.call(arguments)])}})}var s=d.createElement("script");s.src="https://widget.orka.chat/app.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s)})(window,document);
// Keep the fixed navigation below the announcement when its text wraps.
const banner=document.querySelector('#root > div > div.fixed.top-0');
const header=document.querySelector('#root header.fixed.top-8');
if(banner&&header){
 const resize=new ResizeObserver(()=>{
  const height=banner.getBoundingClientRect().height;
  header.style.top=`${height}px`;
  document.documentElement.style.setProperty('--header-offset',`${height+header.getBoundingClientRect().height+16}px`);
 });
 resize.observe(banner);resize.observe(header);
}
