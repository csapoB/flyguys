document.addEventListener('DOMContentLoaded', () => {
    contentFeltolt();
});

function contentFeltolt() {
    let $rolunkDiv = $('<div class="col-sm-8 card"></div>');
    $rolunkDiv.append('<h2 id="cim">Rólunk</h2>');
    $rolunkDiv.append('<p>A FlyGuys-nál hisszük, hogy a repülésnek többről kell szólnia, mint egyszerű közlekedésről – legyen kényelmes, megbízható és valóban élvezetes. Magyarországon alapított, Európa szívében működő légitársaságként célunk, hogy új megközelítést hozzunk a kereskedelmi repülés világába: modern értékekkel, innovatív gondolkodással és kiemelkedő utasközpontú szolgáltatásokkal.</p>');

    $('#rolunk').append($rolunkDiv);

    let $tortenetDiv = $('<div class="col-sm-8 card"></div>');
    $tortenetDiv.append('<h2 id="cim">Történetünk</h2>');
    $tortenetDiv.append('<p>A FlyGuys egy világos küldetéssel jött létre: elérhetővé, hatékonnyá és emberközelivé tenni a légi közlekedést. Magyarországi bázisunkról indulva gyorsan fejlődünk, és egyre több európai és közel-keleti várossal kötjük össze utasainkat – legyen szó üzleti vagy szabadidős utazásról.</p><p>Mint startup légitársaság, rugalmasan alkalmazkodunk és bátran építünk modern megoldásokra. Ennek köszönhetően folyamatosan fejlesztjük szolgáltatásainkat, alkalmazzuk a legújabb repüléstechnikai innovációkat, és biztosítjuk, hogy flottánk a legmagasabb biztonsági, kényelmi és környezeti követelményeknek feleljen meg.</p>');

    $('#tortenet').append($tortenetDiv);

    let $uticelokDiv = $('<div class="col-sm-8 card"></div>');
    $uticelokDiv.append('<h2 id="cim">Úticéljaink</h2>');
    $uticelokDiv.append('<p>Folyamatosan bővülő útvonalhálózatunk összeköti Magyarországot többek között:</p><ul><li>Nyugat-, Közép- és Kelet-Európa nagyvárosaival</li><li>A Balkán fontos központjaival</li><li>A mediterrán régió kedvelt úti céljaival</li><li>A Közel-Kelet legdinamikusabban fejlődő városaival</li></ul><p>Bármi is legyen az úticél – munka, pihenés vagy kaland –, a FlyGuys kényelmes csatlakozásokat, átgondolt menetrendeket és utasainkra szabott szolgáltatásokat kínál, hogy az utazás valóban gördülékeny legyen.</p>');

    $('#uticelok').append($uticelokDiv);


    let $elkotelezetsegunkDiv = $('<div class="col-sm-8 card"></div>');
    $elkotelezetsegunkDiv.append('<h2 id="cim">Elkötelezettségünk</h2>');
    $elkotelezetsegunkDiv.append('<p>A FlyGuys-nál kiemelten fontos számunkra:</p><ul><li>Utasaink kényelme – modern kabinok, barátságos személyzet és utasközpontú szemlélet</li><li>Hatékonyság – pontos és stresszmentes működés</li><li>Biztonság és megbízhatóság – világszínvonalú karbantartás és üzemeltetés</li><li>Innováció – okos technológiai megoldások az utazás minden szakaszában</li><li>Fenntarthatóság – üzemanyag-hatékony működés és felelős növekedés</li></ul>');

    $('#elkotelezetsegunk').append($elkotelezetsegunkDiv);

    let $elmenyDiv = $('<div class="col-sm-8 card"></div>');
    $elmenyDiv.append('<h2 id="cim">FlyGuys élmény</h2>');
    $elmenyDiv.append('<p>Mi többek vagyunk egy légitársaságnál — utazópartnerek vagyunk. Csapatunk minden tagja, a check-intől a pilótafülkéig, azon dolgozik, hogy utasaink meleg, személyes és figyelmes kiszolgálásban részesüljenek. A FlyGuys-nál Ön nem csupán egy utas – Ön a történetünk része, miközben együtt formáljuk a modern európai légi közlekedést.</p>');

    $('#elmeny').append($elmenyDiv);

    let $csatlakozzDiv = $('<div class="col-sm-8 card"></div>');
    $csatlakozzDiv.append('<h2 id="cim">Csatlakozzon hozzánk az égben</h2>');
    $csatlakozzDiv.append('<p>Ahogy tovább bővítjük úti céljainkat és szolgáltatásainkat, örömmel várjuk, hogy velünk repüljön, és megtapasztalja az utazás új szintjét.<br>FlyGuys — Your journey starts with us.</p>');

    $('#csatlakozz').append($csatlakozzDiv);
}





/* Angol szöveg
About Us

At FlyGuys, we believe that air travel should be more than simply getting from point A to point B — it should be comfortable, reliable, and genuinely enjoyable. Founded in Hungary and proudly based in the heart of Europe, FlyGuys is a new-generation commercial airline built on modern values, innovative thinking, and a commitment to exceptional passenger experience.

Our Story

FlyGuys was created with a clear mission: to make air travel accessible, efficient, and comfortable. From our home base in Hungary, we’ve expanded rapidly to connect travelers to key destinations across Europe and the Middle East, offering a growing network of routes designed for both business and leisure passengers.

As a startup airline, we embrace flexibility and forward-thinking solutions. This allows us to continually refine our services, adopt the latest aviation technologies, and ensure our aircraft meet the highest standards of safety, comfort, and environmental responsibility.

Destinations

Our expanding route network links Hungary with major cities and gateway hubs throughout:

Western, Central & Eastern Europe
The Balkans
The Mediterranean region
The Middle East’s most dynamic destinations

Whether traveling for work, relaxation, or adventure, FlyGuys offers smooth connections, convenient schedules, and thoughtfully curated services to make each journey effortless.

Our Commitment

At FlyGuys, we prioritize:

Passenger Comfort – Modern cabins, friendly service, and a customer-first mindset
Efficient Travel – Streamlined operations for punctual, stress-free flights
Safety & Reliability – Aircraft maintained to world-class standards
Innovation – Smart technology that enhances every stage of the travel experience
Sustainability – A focus on fuel-efficient operations and responsible growth
The FlyGuys Experience

We’re more than an airline — we’re your travel partners. Every member of our team, from check-in to cockpit, is dedicated to providing warm service with a personal touch. At FlyGuys, you’re not just a passenger; you’re part of our journey as we redefine what a modern European airline can be.

Join Us in the Sky

As we continue to expand our destinations and services, we invite you to fly with us and experience a new standard of travel.
FlyGuys — Your journey starts with us.
*/