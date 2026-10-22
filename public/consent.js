(() => {
  const KEY='gokarna-cookie-preferences', DENY='gokarna-analytics-denied', MARK='|gokarna-analytics-denied|', ID='G-HXM22WWPKP';
  function denied(){
    if(window.__gokarnaDenied)return true;
    try{if(sessionStorage.getItem(DENY)==='1')return true;}catch{return true;}
    try{return window.name.includes(MARK);}catch{return true;}
  }
  function markDeny(){
    window.__gokarnaDenied=true;window['ga-disable-'+ID]=true;let retained=false;
    try{sessionStorage.setItem(DENY,'1');retained=sessionStorage.getItem(DENY)==='1';}catch{}
    try{window.name=window.name.split(MARK).join('')+MARK;retained=window.name.includes(MARK)||retained;}catch{}
    return retained;
  }
  function clearDeny(){
    // Verify this tab's refusal is clear before publishing a shared grant.
    sessionStorage.removeItem(DENY);
    if(sessionStorage.getItem(DENY)==='1')throw Error('Session refusal remains');
    window.name=window.name.split(MARK).join('');
    if(window.name.includes(MARK))throw Error('Tab refusal remains');
  }
  function read(){
    if(denied())return null;
    try{
      const saved=JSON.parse(localStorage.getItem(KEY)||'null');
      localStorage.setItem(KEY+'-write-check','1');localStorage.removeItem(KEY+'-write-check');
      return saved && typeof saved.analytics==='boolean'?{necessary:true,analytics:saved.analytics,preferences:false,marketing:false}:null;
    }catch{return null;}
  }
  function apply(grant){
    window['ga-disable-'+ID]=!grant;
    if(!grant){window.gtag?.('consent','update',{analytics_storage:'denied'});return;}
    window.dataLayer=window.dataLayer||[];
    window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
    if(document.getElementById('gokarna-ga4')){window.gtag('consent','update',{analytics_storage:'granted'});return;}
    window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('consent','update',{analytics_storage:'granted'});
    const script=document.createElement('script');script.id='gokarna-ga4';script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+ID;document.head.appendChild(script);
    window.gtag('js',new Date());window.gtag('config',ID,{allow_google_signals:false,allow_ad_personalization_signals:false});
  }
  const checkbox=document.getElementById('analytics'),status=document.getElementById('cookie-status');
  let retainedDenial=false,effective=false;
  function refresh(){effective=read()?.analytics===true;apply(effective);if(checkbox)checkbox.checked=effective;}
  function save(analytics){
    analytics=analytics===true;
    if(!analytics){retainedDenial=markDeny();apply(false);}
    try{
      if(analytics){clearDeny();localStorage.getItem(KEY);localStorage.setItem(KEY+'-write-check','1');localStorage.removeItem(KEY+'-write-check');}
      localStorage.setItem(KEY,JSON.stringify({necessary:true,analytics,preferences:false,marketing:false}));
      if(analytics)window.__gokarnaDenied=false;
      refresh();return true;
    }catch{retainedDenial=markDeny();refresh();return false;}
  }
  window.gokarnaConsent={read,save};
  const unused=document.getElementById('preferences');if(unused){unused.checked=false;unused.disabled=true;}
  refresh();
  function choose(value){
    const stored=save(value);
    if(status)status.textContent=stored
      ?effective?'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ Google Analytics ಸಕ್ರಿಯವಾಗಿದೆ.':value?'ಆಯ್ಕೆ ಬರೆಯಲಾಗಿದೆ, ಆದರೆ ಸಂಗ್ರಹವನ್ನು ದೃಢಪಡಿಸಲಾಗಲಿಲ್ಲ. ಈ ಟ್ಯಾಬ್‌ನಲ್ಲಿ Google Analytics ನಿಷ್ಕ್ರಿಯವಾಗಿದೆ.':'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ Google Analytics ನಿರಾಕರಿಸಲಾಗಿದೆ.'
      :retainedDenial?'ಈ ಟ್ಯಾಬ್‌ನಲ್ಲಿ Google Analytics ನಿಷ್ಕ್ರಿಯವಾಗಿದೆ; ಇದೇ ಟ್ಯಾಬ್‌ನಲ್ಲಿ ಪುಟ ಬದಲಿಸಿದರೂ ಅಥವಾ ಮರುಲೋಡ್ ಮಾಡಿದರೂ ನಿರಾಕರಣೆ ಉಳಿಯುತ್ತದೆ. ಶಾಶ್ವತ ಆಯ್ಕೆ ಉಳಿಸಲಾಗಲಿಲ್ಲ; ಇತರ ಟ್ಯಾಬ್‌ಗಳಲ್ಲಿ ಹಿಂದಿನ ಅನುಮತಿ ಇರಬಹುದು. ಹಳೆಯ ಅನುಮತಿ ತೆಗೆದುಹಾಕಲು ಬ್ರೌಸರ್‌ನ ತಾಣದ ದತ್ತಾಂಶವನ್ನು ಅಳಿಸಿ.'
      :'ಈ ಪುಟದಲ್ಲಿ Google Analytics ನಿಷ್ಕ್ರಿಯವಾಗಿದೆ. ಪುಟ ಬದಲಿಸುವಾಗ ಅಥವಾ ಮರುಲೋಡ್ ಮಾಡುವಾಗ ನಿರಾಕರಣೆ ಉಳಿಯುವ ಖಾತರಿಯಿಲ್ಲ. ಹಳೆಯ ಅನುಮತಿ ತೆಗೆದುಹಾಕಲು ಬ್ರೌಸರ್‌ನ ತಾಣದ ದತ್ತಾಂಶವನ್ನು ಅಳಿಸಿ.';
  }
  document.querySelector('[data-save]')?.addEventListener('click',()=>choose(checkbox?.checked===true));
  document.getElementById('reject-all')?.addEventListener('click',()=>choose(false));
  window.addEventListener('storage',event=>{
    if(event.key!==KEY&&event.key!==null)return;
    let grant=false;try{grant=JSON.parse(event.newValue||'null')?.analytics===true;}catch{}
    if(!grant)markDeny();
    refresh();
    if(status)status.textContent=effective?'ಈ ಟ್ಯಾಬ್‌ನಲ್ಲಿ Google Analytics ಸಕ್ರಿಯವಾಗಿದೆ.':grant?'ಈ ಟ್ಯಾಬ್‌ನಲ್ಲಿ Google Analytics ಇನ್ನೂ ನಿಷ್ಕ್ರಿಯವಾಗಿದೆ. ಅನುಮತಿಸಲು ಇಲ್ಲಿ ನಿಮ್ಮ ಆಯ್ಕೆಯನ್ನು ಉಳಿಸಿ.':'ಮತ್ತೊಂದು ಟ್ಯಾಬ್‌ನಲ್ಲಿ ಆಯ್ಕೆ ಬದಲಾಗಿರುವುದರಿಂದ ಈ ಟ್ಯಾಬ್‌ನಲ್ಲಿ Google Analytics ನಿಷ್ಕ್ರಿಯವಾಗಿದೆ.';
  });
})();
