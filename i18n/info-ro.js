Object.assign(window.I18N.ro, {
  infoH1: 'Despre Globe',
  introP1: 'Globe este un glob 3D care se rotește. Alegi o țară și vezi canalele ei TV în browser. Globe nu găzduiește, nu înregistrează și nu copiază niciun stream TV.',

  sec1Title: 'Trei moduri în care se poate deschide un canal',
  way1Title: 'Redat direct în Globe',
  way1Text: 'Canalul publică un stream live deschis (HLS). Globe redă acel stream public în propriul player. Exemple: televiziunea publică TVR, multe televiziuni locale și canale de muzică.',
  way2Title: 'Player oficial, afișat în Globe',
  way2Text: 'Canalul este comercial, iar drepturile de difuzare sunt plătite (de exemplu Antena 1, Kanal D, Prima News sau Voyo Sport). Globe nu preia streamul lor. Afișează site-ul oficial al canalului într-un cadru (iframe), deci playerul oficial, reclamele, condițiile și autentificarea rămân exact cum le vrea canalul.',
  way3Title: 'Doar link',
  way3Text: 'Unele site-uri refuză să fie afișate în altă pagină. În acest caz cadrul rămâne gol, iar linkul de sub el deschide site-ul oficial.',

  sec2Title: 'De ce canalele comerciale se deschid pe site-urile lor originale',
  why1: 'Canalele TV plătesc pentru drepturile de difuzare. A copia streamul lor și a-l retransmite de pe alt site, fără permisiune, este retransmisie neautorizată, chiar dacă streamul este ușor de găsit din punct de vedere tehnic.',
  why2: 'La un player oficial, spectatorul se uită pe pagina canalului. Canalul păstrează controlul: propriul player, propria publicitate, restricțiile pe țară și dreptul de a bloca încorporarea.',
  why3: 'Globe nu ocolește niciodată o restricție. Dacă un canal nu vrea să fie afișat în Globe, poate bloca asta (vezi „De ce unele canale nu se încarcă” mai jos), iar Globe respectă decizia.',

  sec3Title: 'Detalii tehnice',
  tech1: 'Datele despre canale vin din listele publice iptv-org (canale, streamuri și blocklist). Canalele din blocklist, cele închise și cele pentru adulți sunt excluse.',
  tech2: 'Se folosesc doar streamuri HTTPS în format HLS (.m3u8). Browserele nu pot reda direct alte formate, iar o pagină HTTPS nu are voie să încarce streamuri HTTP simple (conținut mixt).',
  tech3: 'Fiecare stream este testat înainte să intre în listă: serverul trebuie să răspundă, să returneze o listă de redare validă (trebuie să înceapă cu #EXTM3U) și să permită accesul dintr-o pagină web (CORS). Streamurile moarte sunt eliminate. Lista este un instantaneu, deci un canal poate înceta să funcționeze mai târziu.',
  tech4: 'Streamurile care vin de pe serverele unei platforme comerciale (de exemplu rețeaua Antena Play) sau care conțin un token de acces nu sunt redate de Globe. Acele canale apar ca playere oficiale.',
  tech5: 'Redarea folosește hls.js (Media Source Extensions). Safari și iPhone-urile redau HLS nativ. Dacă un stream nu pornește în 15 secunde, Globe încearcă o adresă de rezervă, iar dacă nu există, afișează un mesaj.',
  tech6: 'Playerele oficiale se afișează într-un iframe cu restricții (sandbox): scripturile, formularele și ferestrele pop-up sunt permise ca playerul să funcționeze, dar pagina încorporată nu poate prelua Globe și nici nu îl poate redirecționa. Redarea automată și ecranul complet sunt permise. Adresele care încep cu http:// sunt trecute pe https://.',
  tech7: 'Globul este desenat cu WebGL (globe.gl și three.js), pe baza formelor țărilor din Natural Earth. Ora oficială folosește API-ul Intl al browserului și fusul orar IANA al țării; la țările cu mai multe fusuri orare se folosește fusul capitalei. Steagurile vin de la flagcdn.com.',
  tech8: 'Limba se ia din setările telefonului sau ale browserului (engleză, germană, română, franceză sau spaniolă; engleză dacă a ta nu e disponibilă). O poți schimba din selector, iar alegerea se salvează în browser.',

  sec4Title: 'De ce unele canale nu se încarcă',
  fail1: 'Site-ul trimite X-Frame-Options sau un Content-Security-Policy cu frame-ancestors, care îi spune browserului să nu îl afișeze în alte pagini.',
  fail2: 'Blocare pe țară (geo-blocking): multe streamuri și playere funcționează doar în țara canalului.',
  fail3: 'Abonament sau autentificare: serviciile plătite, ca Voyo Sport, cer abonament.',
  fail4: 'Bannerele de cookie-uri, reclamele sau scripturile de pe site-ul oficial pot bloca playerul până accepți sau interacționezi.',
  fail5: 'Streamul s-a mutat, s-a oprit sau a fost retras de proprietar.',

  sec5Title: 'Confidențialitate',
  privacy1: 'Globe nu are conturi, analiză de trafic și nici reclame. Singurul lucru pe care îl salvează în browser este alegerea limbii.',
  privacy2: 'Browserul tău contactează direct terți: biblioteci de cod (unpkg și jsDelivr), formele țărilor (GitHub), steaguri (flagcdn.com), serverele de stream ale canalelor și site-urile oficiale când deschizi un player oficial. Acolo se aplică propriile lor cookie-uri și reguli de publicitate.',

  sec6Title: 'Canalele din această versiune',
  channelsIntro: 'Generat din lista curentă de canale.',
  countryLine: '{country}: {direct} redate direct, {official} playere oficiale',
  officialNames: 'Playere oficiale:',

  dedication: 'Acest website este construit de Virgil C și este în amintirea domnului I. Roth, vecinul meu.'
});
