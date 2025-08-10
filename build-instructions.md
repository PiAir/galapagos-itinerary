**0. Installatie**

* Check op Node.js (v16‑20+)  -> node --version
* Installeer [Android Studio](https://developer.android.com/studio), inclusief Android SDK (minimaal API 23+). Capacitor 7 vereist minimaal Android Studio 2024.2.1
* Installeer [git](https://git-scm.com/downloads/win) op je computer indien nodig
* Haal de repository naar je lokale schijf, in een lege map:
```  
    git clone https://github.com/PiAir/galapagos-itinerary.git/pre>
```  
* Ga naar de map galapagos-itinerary
* Installeer [Capacitor](https://capacitorjs.com/) CLI & Core:
```  
    npm install @capacitor/core
    npm install -D @capacitor/cli
```  
* In dezelfde map initialiseer je Capacitor (ik heb gekozen voor com.gosoftonline.galapagos - kies zelf wat anders):
```
    npx cap init "GalapagosItinerary" "com.jouwbedrijf.galapagos" --web-dir=out
```
**1. next.config.js instellen**

Maak (of update) het bestand next.config.js met:
```
    /** @type {import('next').NextConfig} */
	const nextConfig = {
		output: 'export',
		images: {
	        unoptimized: true
	    },
    };
	module.exports = nextConfig;
```
Dit zorgt ervoor dat Next.js automatisch een statische out/-map genereert wanneer je next build draait.

**2. npm run build draaien**

Je hoeft tegenwoordig geen next export meer te doen. Alles zit verwerkt in next build. Dus in je package.json:
```
    "scripts": {
        "dev": "next dev",
        "build": "next build"
    }
```
Run dan:
```
    npm run build
```
Na afloop staat je volledige statische site in de map out/.

**3. Test de out/ map**

Om te controleren dat alles werkt:
```
    npx serve out
```
Of gebruik `npx http-server out`, of open de bestanden direct in de browser.

**Daarna doorgaan met Capacitor**

We weten nu dat de Next.js website lokaal draait, maar het ging om Android. We hebben al 2 stappen gedaan

**Installeren van Capacitor CLI & Core:**
```
    npm install @capacitor/core
    npm install -D @capacitor/cli
```
**Initialiseren met:**
```
    npx cap init "GalapagosItinerary" com.jouwbedrijf.galapagos --web-dir=out
```
Nu nog stap 3:

**Voeg Android-platform toe en sync:**
```
    npm install @capacitor/android
    npx cap add android
    npx cap sync
```
Ga nu verder in Android Studio. Open de map waar je in hebt zitten werken.

## Vanuit Android Studio

1.  Sluit je Android-toestel aan via USB (zet **USB-debugging** aan op je telefoon).
2.  In Android Studio kies je bovenaan rechts je apparaat of emulator als target.
3.  Klik op de **Run ▶️**-knop.
4.  De app wordt gebouwd, geïnstalleerd en gestart op je telefoon.
5.  Gebruik **Logcat** onderin Android Studio voor debugging


## Updaten Android app na wijzigingen in Firebase:

Als je in Firebase of Visual Studio Code wijzigingen hebt doorgevoerd, dan moet je de code builden en dan weer synchroniseren:
```
    npm run build
    npx cap sync android
```
Met 
```
    npx cap run android
```
zou je hem dan vanaf de commandline moeten kunnen runnen, maar dat werkte bij mij nooit lekker. Na de sync ga ik naar Android Studio en test daar de code.
