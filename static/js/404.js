
"use strict";

document.addEventListener('DOMContentLoaded', (event) => {
    console.log(`${event.type} Event Fired`);

    document.getElementById("lottie-animation").addEventListener('load' , (event) => {
        console.log(`${event.type} Event Fired`);

        cuteVisible404();
    }, { once: true });

    /* Αν ο εμφωλευμένος event listener στηθεί μετά τη φόρτωση του lf20_HpFqiS.json, τότε δε θα ακούσει ποτέ το event
    Για αυτό το λόγο, βάζω μια δικλείδα ασφαλείας 2 δευτερολέπτων */
    setTimeout(() => {
        console.log('Security timeout activated');
        cuteVisible404();
    }, 2000);

    /*
        Μόλις τρέξει το visibility:visible θα εμφανίσει κατευθείαν το popup. Άρα, όταν θα τρέξει το
        opacity:1 δε θα αντιληφθεί κάποια αλλαγή και δε θα ενεργοποιηθεί το transition opacity 1s.

        Λύση: Βάζω λίγη καθυστέρηση (πχ 10 milliseconds) μετά το visibility:visible
    */
    function cuteVisible404() {
        const hiddenTag = document.getElementById("hidden-404-text");

        hiddenTag.style.visibility = "visible";
        setTimeout(function() {
            hiddenTag.style.opacity = 1;
            hiddenTag.style.transition = 'opacity 1s ease-in-out';
        }, 10);
    }
}, { once: true });