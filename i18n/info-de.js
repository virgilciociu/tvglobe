Object.assign(window.I18N.de, {
  infoH1: 'Über Globe',
  introP1: 'Globe ist ein rotierender 3D-Globus. Wähle ein Land und sieh dir seine Fernsehsender im Browser an. Globe hostet, speichert oder kopiert keinen TV-Stream.',

  sec1Title: 'Drei Arten, wie sich ein Sender öffnet',
  way1Title: 'Direkt in Globe abgespielt',
  way1Text: 'Der Sender veröffentlicht einen offenen Live-Stream (HLS). Globe spielt diesen öffentlichen Stream im eigenen Player ab. Beispiele: der öffentlich-rechtliche Sender TVR, viele lokale Sender und Musikkanäle.',
  way2Title: 'Offizieller Player, in Globe angezeigt',
  way2Text: 'Der Sender ist kommerziell und seine Senderechte sind bezahlt (zum Beispiel Antena 1, Kanal D, Prima News oder Voyo Sport). Globe übernimmt seinen Stream nicht. Stattdessen wird die offizielle Website des Senders in einem Rahmen (iframe) angezeigt, sodass der offizielle Player, die Werbung, die Bedingungen und jede Anmeldung genau so bleiben, wie der Sender es vorgesehen hat.',
  way3Title: 'Nur Link',
  way3Text: 'Manche Websites lehnen es ab, in einer anderen Seite angezeigt zu werden. Dann bleibt der Rahmen leer, und der Link darunter öffnet die offizielle Website.',

  sec2Title: 'Warum kommerzielle Sender auf ihren Originalwebsites öffnen',
  why1: 'Fernsehsender zahlen für Senderechte. Ihren Stream ohne Erlaubnis zu kopieren und von einer anderen Website erneut auszustrahlen, ist eine nicht genehmigte Weiterverbreitung, auch wenn der Stream technisch leicht erreichbar ist.',
  why2: 'Bei einem offiziellen Player schaut man auf der eigenen Seite des Senders. Der Sender behält die Kontrolle: eigener Player, eigene Werbung, eigene Ländersperren und das Recht, das Einbetten zu blockieren.',
  why3: 'Globe umgeht niemals eine Einschränkung. Wenn ein Sender nicht in Globe angezeigt werden will, kann er das unterbinden (siehe „Warum manche Sender nicht laden“ weiter unten), und Globe respektiert das.',

  sec3Title: 'Technische Details',
  tech1: 'Die Senderdaten stammen aus den öffentlichen iptv-org-Listen (Sender, Streams und Blocklist). Sender auf der Blocklist, geschlossene und nicht jugendfreie Sender werden ausgelassen.',
  tech2: 'Es werden nur HTTPS-Streams im HLS-Format (.m3u8) verwendet. Browser können andere Formate nicht direkt abspielen, und eine HTTPS-Seite darf keine einfachen HTTP-Streams laden (Mixed Content).',
  tech3: 'Jeder Stream wird getestet, bevor er in die Liste kommt: Der Server muss antworten, eine gültige Playlist liefern (sie muss mit #EXTM3U beginnen) und den Zugriff von einer Webseite erlauben (CORS). Tote Streams werden entfernt. Die Liste ist eine Momentaufnahme, ein Sender kann also später ausfallen.',
  tech4: 'Streams von den Servern einer kommerziellen Plattform (zum Beispiel des Antena-Play-Netzwerks) oder mit Zugriffstoken spielt Globe nicht ab. Diese Sender erscheinen stattdessen als offizielle Player.',
  tech5: 'Die Wiedergabe nutzt hls.js (Media Source Extensions). Safari und iPhones spielen HLS nativ ab. Startet ein Stream nicht innerhalb von 15 Sekunden, versucht Globe eine Ersatzadresse, und falls es keine gibt, zeigt es eine Meldung.',
  tech6: 'Offizielle Player werden in einem iframe mit Einschränkungen (Sandbox) angezeigt: Skripte, Formulare und Pop-ups sind erlaubt, damit der Player funktioniert, aber die eingebettete Seite kann Globe nicht übernehmen oder wegleiten. Autoplay und Vollbild sind erlaubt. Adressen mit http:// werden auf https:// umgestellt.',
  tech7: 'Der Globus wird mit WebGL (globe.gl und three.js) aus den Ländergrenzen von Natural Earth gezeichnet. Die offizielle Zeit nutzt die Intl-API des Browsers und die IANA-Zeitzone des Landes; bei Ländern mit mehreren Zeitzonen wird die Zone der Hauptstadt verwendet. Die Flaggen kommen von flagcdn.com.',
  tech8: 'Die Sprache wird aus den Einstellungen des Telefons oder Browsers übernommen (Englisch, Deutsch, Rumänisch, Französisch oder Spanisch; Englisch, wenn deine nicht verfügbar ist). Du kannst sie über die Auswahl ändern, die Wahl wird im Browser gespeichert.',

  sec4Title: 'Warum manche Sender nicht laden',
  fail1: 'Die Website sendet X-Frame-Options oder eine Content-Security-Policy mit frame-ancestors, die dem Browser sagt, sie nicht in anderen Seiten anzuzeigen.',
  fail2: 'Geoblocking: Viele Streams und Player funktionieren nur im Land des Senders.',
  fail3: 'Bezahlschranke oder Anmeldung: Bezahldienste wie Voyo Sport brauchen ein Abonnement.',
  fail4: 'Cookie-Banner, Werbung oder Skripte auf der offiziellen Website können den Player blockieren, bis du zustimmst oder interagierst.',
  fail5: 'Der Stream wurde verschoben, gestoppt oder vom Eigentümer entfernt.',

  sec5Title: 'Datenschutz',
  privacy1: 'Globe hat keine Konten, keine Analyse und keine Werbung. Das Einzige, was im Browser gespeichert wird, ist deine Sprachwahl.',
  privacy2: 'Dein Browser kontaktiert Dritte direkt: die Code-Bibliothek hls.js (jsDelivr, nur beim Abspielen eines Streams), Flaggen (flagcdn.com), das Google-Cast-Skript (gstatic.com, nur außerhalb von Safari), die Stream-Server der Sender und die offiziellen Websites, wenn du einen offiziellen Player öffnest. Dort gelten deren eigene Cookies und Werberegeln.',

  sec6Title: 'Sender in dieser Version',
  channelsIntro: 'Aus der aktuellen Senderliste erzeugt.',
  countryLine: '{country}: {direct} direkt abgespielt, {official} offizielle Player',
  officialNames: 'Offizielle Player:',

  dedication: 'Diese Website wurde von Virgil C erstellt und ist dem Andenken von Herrn I. Roth gewidmet, meinem Nachbarn.'
});
