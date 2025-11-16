
/*  ΠΡΟΣΟΧΗ

    Έχω δύο Event Listeners όπου ο 2ος είναι εμφωλευμένος μέσα στον 1ο
    Και οι δύο Event Listeners στήνονται σε ολόκληρο το document

    Listener 1 (DOMContentLoaded):
        1) Στήνεται μόλις φορτωθεί το animation.js
            δηλ μόλις το html parsing φτάσει στο <script 'animation.js'> και συγκεκριμένα πριν κατασκευαστεί ολόκληρο το DOM
        2) Πυροδοτείται μόλις κατασκευαστεί ολόκληρο το DOM
            δηλ πριν φορτωθούν τα images, animations, json κλπ

    Listener 2 (load ή ready ή play)εμφωλευμένος μέσα στον Listener 1:
        1) Στήνεται μόλις πυροδοτηθεί το DOMContentLoaded και μετά από την εκτέλεση των ........
            δηλ μετά την κατασκευή του DOM, κατά το διάστημα που φορτώνονται τα images, animations, json κλπ
        2) Πυροδοτείται μετά την κατασκευή του DOM και μετά την εκτέλεση των ........
            δηλ κατά το διάστημα που φορτώνονται τα images, animations, json κλπ

        Άρα, αν το animation αστροναύτης (lf20_ydo1amjm.json) φορτωθεί πιο γρήγορα (πχ λόγω cache).
        τότε και ο Listener 2 ακούει στο event "load" ή "ready" τότε δε θα το ακούσει ποτέ.
        Κατά συνέπεια, θα ενεργοποιηθεί η δικλείδα ασφαλείας του 2 δευτερολέπτων !!!

    document.addEventListener('DOMContentLoaded' , {
        ....
        ....
        ....
        document.addEventListener('load ή ready ή play' , {...});
    });

    Άρα, για να δουλέψει σωστά θα πρέπει οπωσδήποτε να βάλω δικλείδα ασφαλείας 2 δευτερολέπτων
    για την περίπτωση που το lf20_ydo1amjm.json προλάβει και φορτωθεί πριν στηθεί ο εμφωλευμένος listener !!!

    Αν ο εμφωλευμένος Event Listener δεν προλάβει να ακούσει το event και ενεργοποιηθεί η δικλείδα ασφαλείας,
    τότε ο εμφωλευμένος listener θα επιβαρύνει άσκοπα την απόδοση του client browser διότι θα περιμένει
    να ακούσει ένα event που δε θα πυροδοτηθεί ποτέ.
        -->  Συνεπώς, καλό είναι η δικλείδα ασφαλείας να διαγράψει τον listener αλλά και το χρονόμετρο
*/

"use strict";

document.addEventListener('DOMContentLoaded', (event) => {
    console.log(`${event.type} Event Fired`);
    const lottieAnimation = document.getElementById("lottie-animation");
    let eventFired = false;

    // Στήνω τον εμφωλευμένο listener που θα προσπαθήσει να ακούσει το event load ή το ready ή το play
    function lottieAnimationFunction(event){
        console.log(`${event.type} Event Fired`);
        cuteVisible404();
        eventFired = true;
        clearTimeout(lottieTimeout);
        console.log('Timeout is cleared to save resources as the listener have listened the event');
    }
    lottieAnimation.addEventListener('load' , lottieAnimationFunction, { once: true });

    /* Αν ο εμφωλευμένος event listener στηθεί μετά τη φόρτωση του lf20_HpFqiS.json, τότε δε θα ακούσει ποτέ το event
    Για αυτό το λόγο, βάζω μια δικλείδα ασφαλείας 2 δευτερολέπτων */
    const lottieTimeout = setTimeout(() => {
        if (eventFired === false) {
            console.log('Security timeout activated');
            cuteVisible404();
            lottieAnimation.removeEventListener('load', lottieAnimationFunction);
            console.log('Nested Event Listener is removed to save resources as the event have already fired');
        }
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