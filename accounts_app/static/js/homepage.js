
"use strict";

document.addEventListener('DOMContentLoaded', function(event) {
    console.log(`${event.type} Event Fired`);

    /* 
    Ελέγχω αν ο χρήστης θέλει να πάει στη σελίδα login.html ή στη σελίδα register.html
        Λύση 1: Απλή λύση με 2 Event Listeners
                    --> +1 που ακούει στο κουμπί go-login
                    --> +1 που ακούει στο κουμπί go-register

        Λύση 2: Καλύτερη λύση με μόνο 1 Event Listener που ακούει σε όλο το container που
                περιέχει τα 2 κουμπιά και εντοπίζει ποιό web component ή html tag τον ενεργοποίησε.
    
        Λύση 1
    document.getElementById('go-login').addEventListener("click", function() {
        window.location.href = this.dataset.url;
    });

    document.getElementById('go-register').addEventListener("click", function() {
        window.location.href = this.dataset.url;
    });
    */

    /* Λύση 2: Event Delegation */
    document.getElementById('buttons-container').addEventListener("click", (event) => {
        const element = event.target;
        console.log(element);
        /*
            Προσοχή
            
            Όταν δεν κάνω Event Delegation:
                Το click event μπορεί να πυροδοτηθεί μόνο από το <button>

            Όταν κάνω Event Delegation:
                Το click event μπορεί να πυροδοτηθεί από οπουδήποτε εντός του CONTAINER
                Αν πυροδοτηθεί από τα <button> έχει καλώς. Το event.target θα δείχνει το html element

                Αν, όμως, ο χρήστης πατήσει κάπου αλλού μέσα στο CONTAINER θα πυροδοτηθεί πάλι το event click
                Όμως, το event.target θα είναι null
                Συνεπώς, το element.dataset.url θα γίνει "undefined" διότι δε θα πάρει το url από το <button data-url="...">
                Ως αποτέλεσμα, ο χρήστης θα κάνει HTTP GET undefined/ το οποίο θα πάει στη σελίδα 404.html

            Λύση: Για να κάνω σωστά Event Delegation πρέπει να μεριμνήσω ώστε αν πυροδοτηθεί το event
                από κάτι άσχετο (background, margin, padding κλπ), τότε το event να αγνοηθεί.
        */
        if ((element.id === 'go-login') || (element.id === 'go-register')) {
            window.location.href = element.dataset.url;
        }
        else {
            console.log('Event Delegation: a click event was fired by accident and is successfully ignored to prevent a 404 page');
        }
    });
}, { once: true });