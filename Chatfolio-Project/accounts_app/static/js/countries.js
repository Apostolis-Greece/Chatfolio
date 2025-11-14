
"use strict";

/*
    Λύση 1
        1. Φορτώνω την κάθε σημαία ξεχωριστά
        2. Όμως, αυτό απαιτεί από ένα HTTP GET Request/Response για να φορτωθεί η κάθε σημαία

        .country-flag {
            width: 40px; height: 30px; /* Όλες οι σημαίες είναι 40x30 pixels
            object-fit: contain; /* εξασφαλίζει ότι δε θα κοπεί μέρος της φωτογραφίας
            display: block; /* για να μην αφήνει περιττά κενά
            border: none;
        }

    Λύση 2
        1. Συμπιέζω όλες τις σημαίας σε 1 μόνο αρχείο zip
        2. Άρα, θα χρειαστεί μόνο 1 HTTP GET Request/Response για να φορτωθούν όλες τις σημαίες
        3. Όμως, η JavsScript θα πρέπει να αποσυμπιέσει το zip χάνοντας χρόνο

    Λύση 3
        1. Εφαρμόζω την τεχνική "spritesheet" ή "texture atlas", εκμεταλλευόμενος το γεγονός ότι
        όλες οι σημαίες έχουν ίδιες διαστάσεις και τις τοποθετώ όλες σε μια υπερ-φωτογραφία
        όπου η κάθε σημαία έχει τις συντεταγμένες τις (x,y) σε αυτήν την υπερ-φωτογραφία
        2. Άρα, θα χρειαστεί μόνο 1 HTTP GET Request/Response για να φορτωθεί η υπερ-φωτογραφία
        3. Άρα, δε θα χρειαστεί καθόλου JavsScript για να αποσυμπιέσει κάτι

    Λύση 4
        Συμπίεζω την υπερ-φωτογραφία για να φορτωθεί πιο γρήγορα και με λίγη JavaScript την αποσυμπιέζω
*/

document.addEventListener('DOMContentLoaded', (event) => {
    console.log(`${event.type} Event Fired`);

    const countryContainerTag = document.getElementById('country-container');
    const countrySelectTag = document.getElementById('country-select');
    const countryOptionsContainerTag = countryContainerTag.querySelector('.country-options-container');

    // Διαβάζω τα URLs από το <div data-flags-url="..." data-sprites-json-url="..."> του register.html
    const staticUrl = countryContainerTag.dataset.flagsUrl;
    const spritesUrl = countryContainerTag.dataset.spritesJsonUrl;

    /* Φoρτώνω με Ασύγχρνονο JSON Request το spritesheet.json που περιέχει τις συντεταγμένες της κάθε
       σημαίας μέσα στο flags-spritesheet.png και έπειτα γεμίζω το dropdown list με όλες τις χώρες*/
    fetch(spritesUrl)
        .then(res => res.json())
        .then(data => {
            // Προσθήκη κενής χώρας αν ο χρήστης δε θέλει να πει την καταγωγή του
            const emptyOption = document.createElement('div');
            emptyOption.classList.add('country-option');
            emptyOption.innerHTML = `<span></span><span class="span-country-name"></span>`;
            countryOptionsContainerTag.appendChild(emptyOption);

            // Προσθήκη υπόλοιπων χωρών από το αρχείο sprites.json
            data.forEach(sprite => {
                //console.log(sprite.name);

                const option = document.createElement('div');
                option.classList.add('country-option');
                /* Όλες οι σημαίες είναι 40x30 pixels
                   Προσοχή:  Για να μπορέσει να εφαρμοστεί js minification στο countries.js
                   πρέπει να βάλω αυτήν την εντολή σε σχόλια και να τη γράψω όλη σε 1 γραμμή.
                   Αλλιώς, το django-compressor μπερδεύεται και βγάζει σφάλμα HTTP 500 η σελίδα register.html
                option.innerHTML = `
                    <span class="country-flag" style="
                        background-image: url('${staticUrl}');
                        background-position: -${sprite.x}px -${sprite.y}px;
                        width: ${sprite.width}px;
                        height: ${sprite.height}px;
                        display: inline-block;
                    "></span>
                    <span>${sprite.name}</span>
                `;
                */
                option.innerHTML = `<span class="country-flag" style="background-image: url('${staticUrl}'); background-position: -${sprite.x}px -${sprite.y}px; width: ${sprite.width}px; height: ${sprite.height}px; display: inline-block;"></span><span class="span-country-name">${sprite.name}</span>`;
                countryOptionsContainerTag.appendChild(option);
            });
        })
        .catch(err => console.error("Error loading sprites JSON:", err));

    /* Λύση 1
        Για την κάθε χώρα στήνω έναν event listener για:
            α) να εμφανίζει τη χώρα που επέλεξε ο χρήστης στη ρίζα του dropdown list
            β) να κλείνει το dropdown list
    *//*
    option.addEventListener('click', () => {
        countrySelectTag.innerHTML = option.innerHTML;
        countryOptionsContainerTag.style.display = 'none';
    });*/

    /*  Λύση 2
        Αντί να στήσω 1 event listener για κάθε χώρα και να επιβαρύνω αρκετά την απόδοση της σελίδας,
        θα εφαρμόσω την τεχνική Event Delegation, δηλ. θα στήσω έναν listener στο CONTAINER ΚΑΙ ΟΧΙ ΣΤΑ ΕΠΙΜΕΡΟΥΣ ΣΤΟΙΧΕΙΑ και θα ψάξω να βρω από ποιο ΠΑΙΔΙ πυροδοτήθηκε το event μέσω event.target.

        bug: const element = event.target;
            Εδώ το target δεν είναι ένα απλό element αλλά ένα container που περιέχει πολλά elements
                δηλ.  <div class="country-option">
                        <img>
                        <span>
                        </div>
            Αν το <span> πυροδοτήσει το event, τότε θα έχω πρόβλημα γιατί θα εμφανίσει element.innerHTML
            δηλ. θα εμφανίσει μόνο το όνομα της χώρας χωρίς τη σημαία της.
            Αν το <img> πυροδοτήσει το event, τότε θα έχω πρόβλημα γιατί θα εμφανίσει element.innerHTML
            δηλ. θα εμφανίσει μόνο τη σημαία της χώρας χωρίς το όνομα της.

        Λύση: Οποιοήποτε στοιχείο (<span> ή <img>) κι αν πυροδοτήσει το event, θα ψάξω προς τα πάνω στο DOM
                μέχρι να βρω το container που περιέχει και το όνομα και τη σημαία της χώρας.
                Δηλ. ψάχνω να βρω το: <div class="country-option">
                Έτσι, όταν θα κάνω element.innerHTML θα εμφανιστεί και το όνομα και η σημαία της χώρας.
    */
    countryOptionsContainerTag.addEventListener('click', (event) => {
        const element = event.target.closest('.country-option'); console.log(element);
        const countrySelectTag = document.getElementById('country-select');

        if (element === null) {
            console.log('Event Delegation: a click event was fired by accident and is successfully ignored');
            return;
        }

        countrySelectTag.innerHTML = element.innerHTML;
        const countryName = element.querySelector('.span-country-name').textContent;
        countrySelectTag.dataset.value = countryName;
        countryOptionsContainerTag.style.display = 'none';
    });

    /* Στήνω έναν event listener για την εμφάνιση/απόκρυψη του dropdown list */
    countrySelectTag.addEventListener('click', () => {
        const isVisible = countryOptionsContainerTag.style.display === 'block';
        countryOptionsContainerTag.style.display = isVisible ? 'none' : 'block';
    });

    /* Στήνω έναν event listener για να κλείνει το dropdown list όταν πατηθεί κλικ εξωτερικά αυτού,
        ελέγχοντας αν το στοιχείο που πυροδότησε το click event είναι εντός του dropdown list ή όχι */
    document.addEventListener('click', (e) => {
        if (!countryContainerTag.contains(e.target)) {
            countryOptionsContainerTag.style.display = 'none';
        }
    });
}, { once: true });