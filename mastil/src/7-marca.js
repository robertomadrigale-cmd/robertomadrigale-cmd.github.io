/* Marca Om. Copia local: esta app todavía no concatena mastil/comun/. */
function omLogo({color='#2f7bff',size=64}={}){
  omLogo.seq=(omLogo.seq||0)+1;const id='omg'+omLogo.seq,n=Number(size)||64;
  return`<svg class="om-logo" viewBox="0 0 108 64" width="${n}" height="${Math.round(n*.6)}" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f7bff"/><stop offset="1" stop-color="#ff4fa3"/></linearGradient></defs><g fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="28" cy="32" r="27" stroke="${color}" stroke-width="1.5" opacity=".12"/><circle cx="28" cy="32" r="21" stroke="${color}" stroke-width="2" opacity=".3"/><circle cx="28" cy="32" r="14" stroke="${color}" stroke-width="8"/><path d="M54 47V27c0-5 3.2-8 7.5-8s7.5 3 7.5 8v20V27c0-5 3.2-8 7.5-8s7.5 3 7.5 8v20" stroke="url(#${id})" stroke-width="8.5"/></g></svg>`;
}
function automatiaMark(){return'<span class="automatia-mark" style="white-space:nowrap">by AutomaT<span style="color:#2ec4b6">IA</span></span>'}
