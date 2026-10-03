/**
 * Runs inline, before React loads. Marks every [data-reveal] element with `data-in` once it scrolls into view,
 * which is what the CSS in home.css animates. A MutationObserver picks up pages that are rendered later by client navigation.
 * Margins match what the old framer-motion version used: Reveal -12%, MaskLine -10%.
 */
export const REVEAL_SCRIPT = `(function(){
var d=document;
if(!("IntersectionObserver" in window)){d.documentElement.setAttribute("data-no-io","");return}
function make(m){var io=new IntersectionObserver(function(es){for(var i=0;i<es.length;i++){if(es[i].isIntersecting){es[i].target.setAttribute("data-in","");io.unobserve(es[i].target)}}},{rootMargin:m});return io}
var r=make("-12% 0px"),m=make("-10% 0px");
function watch(el){if(el.hasAttribute("data-in"))return;(el.getAttribute("data-reveal")==="m"?m:r).observe(el)}
function scan(root){if(root.nodeType!==1)return;if(root.hasAttribute("data-reveal"))watch(root);var n=root.querySelectorAll("[data-reveal]");for(var i=0;i<n.length;i++)watch(n[i])}
scan(d.documentElement);
new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var a=ms[i].addedNodes;for(var j=0;j<a.length;j++)scan(a[j])}}).observe(d.documentElement,{childList:true,subtree:true})
})();`;
