**1. next.config.js instellen**

Maak (of update) het bestand next.config.js met:

    /** @type {import('next').NextConfig} */
	const nextConfig = {
		output: 'export',
		images: {
	        unoptimized: true
	    },
    };
	module.exports = nextConfig;

Dit zorgt ervoor dat Next.js automatisch een statische out/-map genereert wanneer je next build draait.

**2. Alleen npm run build draaien**

Je hoeft daarna geen next export meer te doen. Alles zit verwerkt in next build. Dus in je package.json:

    "scripts": {
        "dev": "next dev",
        "build": "next build"
    }

En run dan:

    npm run build

Na afloop staat je volledige statische site in de map out/.

**3. Test de out/ map**

Om te controleren dat alles werkt:

    npx serve out

Of gebruik `npx http-server out`, of open de bestanden direct in de browser.

**Daarna doorgaan met Capacitor**

**1.  Installeer Capacitor CLI & Core:**

    npm install @capacitor/core
    npm install -D @capacitor/cli

**2.  Initialiseer met:**

    npx cap init "GalapagosItinerary" com.jouwbedrijf.galapagos --web-dir=out

**3.  Voeg Android-platform toe en sync:**

    npm install @capacitor/android
    npx cap add android
    npx cap sync
    npx cap open android

## Vanuit Android Studio

1.  Sluit je Android-toestel aan via USB (zet **USB-debugging** aan op je telefoon).
2.  In Android Studio kies je bovenaan rechts je apparaat of emulator als target.
3.  Klik op de **Run ▶️**-knop.
4.  De app wordt gebouwd, geïnstalleerd en gestart op je telefoon.
5.  Gebruik **Logcat** onderin Android Studio voor debugging


**4.  Updaten Android app na wijzigingen in Firebase:**

    npm run build
    npx cap sync android
    npx cap run android
