
document.addEventListener('DOMContentLoaded',()=>{const modal=document.querySelector('#success-modal');if(!modal)return;new MutationObserver(()=>{if(!modal.hidden)window.showActivityReward?.();}).observe(modal,{attributes:true,attributeFilter:['hidden']});});
