
/*
    Προσοχή

    Στη JavaScript, καλό είναι να μη χρησιμοποιούμε global variables διότι αποθηκεύονται στο "object document" δηλ. στο DOM.
    Συνεπώς, ο JavaScript Garbage Collector θεωρεί ότι χρειάζονται και δεν τις καθαρίζει και προκαλείται διαρροή μήνης (Memory Leakage).

    Για αυτό το λόγο, καλό είναι όλα τα JavaScript αρχεία να ξεκινάνε κάπως έτσι:
        "use strict";

        document.addEventListener('DOMContentLoaded', function() {
            ....
            ....
            ....
        }, { once: true });

    Με τη χρήση του "use strict"; αποφεύγω να δημιουργήσω κατά λάθος global variables και να προκαλέσω διαρροή μνήμης.
    Βάζοντας όλο τον κώδικα javascript σε EventListener("DOMContentLoaded") πετυχαίνω τα εξής:
        1) Οι μεταβλητές που θα όριζα ως global, τώρα είμαι βέβαιος ότι θα είναι local
           γιατί θα ανήκουν μέσα στο scope της callback function που καλεί ο Event Listener

        2) Μπορώ να φορτώσω όλα τα js files στην αρχή του κάθε html file (δηλ. στο <head>)
           χωρίς να καθυστερήσει η διαδικασία html parsing (δηλ. χωρίς να επιβαρυνθεί το user experience)
           μιας και όλο το περιεχόμενο του javascript θα εκτελεστεί μόνο όταν χτιστεί πλήρως το DOM
*/

"use strict";

document.addEventListener('DOMContentLoaded', function(event) {
    console.log(`${event.type} Event Fired`);
    const passwordValueTag = document.getElementById('password-textfield');
    const confirmValueTag = document.getElementById('confirm-textfield');

    passwordValueTag.addEventListener('input', checkIfMatchPasswords);
    passwordValueTag.addEventListener('input', updatePasswordMeter);
    confirmValueTag.addEventListener('input', checkIfMatchPasswords);

    /*
        Αν η φόρμα δεν είναι έγκυρη, δε στείλω αίτημα στο back-end για να:
            α) μην επιβαρύνω χωρίς λόγο τον server
            β) μην επιβαρύνω το user experience με την καθυστέρηση όσπου να πάει το request και να έρθει το response
    
        Ενώ αν η φόρμα είναι έγκυρη, τότε στέλνω Ασύγχρονο JSON POST Request για να ελεγχθεί περαιτέρω
        από το forms.py, βάζοντας Lazy Load για καλό user experience.
    */
    document.getElementById('register-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const popupErrorsContainerTag = document.getElementById('popup-errors-container');
        const lazyLoadTag = document.getElementById('lazy-load');
        const errorsText = document.getElementById('errors-text');

        if (validateRegisterForm() === false) {
            errorsText.innerHTML = 'Invalid Form';
            popupErrorsContainerTag.style.display = 'block';
        }
        else {
            lazyLoadTag.style.display = 'block';
            registerAsyncPostRequest();
            console.log("fetch is an async function, i.e. it returns a Promise instead of blocking the main thread. So, this message is printed before JSON POST Reply.");
        }
    });


    // ------------------------------------ Define Functions
    // ----------------------------------- Password How Strong Is
    function updatePasswordMeter(){
        const passwordStrongBarTag = document.getElementById('passwordStrongBar');
        const passwordValueTag = document.getElementById('password-textfield');
        const passwordErrorTag = document.getElementById('password-error-area');

        const passwordValue = passwordValueTag.value || '';
        const score = computePasswordStrength(passwordValue);
        const percent = (score / 5) * 90; // κανονικοποίηση ώστε το 100% να απλώνεται στο 90% του container
        passwordStrongBarTag.style.width = percent + '%';
        passwordStrongBarTag.style.backgroundColor = "#ff5733";
        
        if(score === 0){ passwordErrorTag.textContent = ''; }
        else if(score === 1){ passwordErrorTag.textContent = 'Very Weak Password'; }
        else if(score === 2) passwordErrorTag.textContent = 'Weak Password';
        else if(score === 3) passwordErrorTag.textContent = 'Good Password';
        else if(score === 4) passwordErrorTag.textContent = 'Strong Password';
        else if(score === 5) passwordErrorTag.textContent = 'Very Strong Password';
        return score;
    }

    function computePasswordStrength(password){
        let score = 0;
        if(password.length >= 8) score += 1;
        if(/[A-Z]/.test(password)) score += 1;
        if(/[a-z]/.test(password)) score += 1;
        if(/[0-9]/.test(password)) score += 1;
        if(/[^A-Za-z0-9]/.test(password)) score += 1;
        return score;
    }


    // ----------------------------------- Check if Password and Confirm Match
    function checkIfMatchPasswords() {
        const passwordValueTag = document.getElementById('password-textfield');
        const confirmValueTag = document.getElementById('confirm-textfield');
        const confirmErrorTag = document.getElementById('confirm-error-area');

        if ((passwordValueTag.value === '') && (confirmValueTag.value === '')) {
            confirmErrorTag.textContent = 'Empty Passwords';
            confirmErrorTag.style.color = 'red';
            return false;
        }
        
        if (passwordValueTag.value === confirmValueTag.value){
            confirmErrorTag.textContent = 'Passwords Match';
            confirmErrorTag.style.color = 'green';
            return true;
        }
        else{
            confirmErrorTag.textContent = 'Passwords Mismatch';
            confirmErrorTag.style.color = 'red';
            return false;
        }
    }

    // ----------------------------------- Check if Password is Strong
    function checkIfPasswordIsStrong(){
        if (updatePasswordMeter() === 5) {
            return true;
        }
        else {
            return false;
        }
    }


    function validateRegisterForm() {
        const emailValueTag = document.getElementById('email-textfield');
        const passwordValueTag = document.getElementById('password-textfield');
        const confirmValueTag = document.getElementById('confirm-textfield');
  
        if (emailValueTag.value === '') return false;
        if (passwordValueTag.value === '') return false;
        if (confirmValueTag.value === '') return false;
        if (checkIfMatchPasswords() === false) return false;
        if (checkEmail() === false) return false;
        if (checkIfPasswordIsStrong() === false) return false;
        return true;
    }


    /* Προσοχή
        α) Μετά από HTTP POST Request (πχ <form method="POST">) πρέπει να κάνω redirect σερβίροντας GET
            ώστε αν ο χρήστης κάνει reload να μη γίνει διπλό POST και δημιουργηθεί πρόβλημα.
            δηλ. redirect(...) και όχι render(...)

        β) Μετά από JSON POST Request (πχ <form id> getElementById.addEventListener("submit"), {...}
            δεν κινδυνεύω από διπλό POST και η JavaScript από το front-end απλά θα κάνει href ή καλύτερα replace()
    */
    function registerAsyncPostRequest(){
        const popupErrorsContainerTag = document.getElementById('popup-errors-container');
        const errorsText = document.getElementById('errors-text');
        const lazyLoadTag = document.getElementById('lazy-load');

        const userCredentials = {
            email: document.getElementById('email-textfield').value,
            password: document.getElementById('password-textfield').value,
            confirm: document.getElementById('confirm-textfield').value,
            country: document.getElementById('country-select').dataset.value || ''
        };
        console.log(userCredentials);
        
        const url = '/register/';
        let fetchData = {
            method: 'POST',
            body: JSON.stringify(userCredentials),
            headers: new Headers({
                'Content-Type': 'application/json; charset=UTF-8',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value // CSRF token αφού κάνω POST σε δικό μου URL
            })
        }

        fetch(url, fetchData)
        .then(response => response.json())
        .then(responseData => {
            if (responseData.status === 'success') {
                lazyLoadTag.style.display = 'none'; // Κρύβω το Spinner μόλις έρθει το JSON POST Response
                openPopupCredentials();

                document.getElementById('popup-buttons-container').addEventListener('click', function(event) {
                    const element = event.target.id; //console.log(element)

                    if (element === 'yes-button') {
                        localStorage.setItem(`loginCredentials_${userCredentials.email}`, JSON.stringify(userCredentials));
                    }

                    closePopupCredentials()
                    lazyLoadTag.style.display = 'none';
                    window.location.replace('/login/');
                });
            }
            /* Αν το JSON POST Response είναι {success: 'false'} τότε κρύβω το Spinner
            και εμφανίζω το popup με τα σφάλματα */
            else {
                lazyLoadTag.style.display = 'none';
                errorsText.innerHTML = responseData.message;
                popupErrorsContainerTag.style.display = 'block';
            }
        })
        .catch(error => {
            lazyLoadTag.style.display = 'none'; // Κρύβω το Spinner μόλις έρθει το JSON POST Response
            console.error('Error:', error);
        });
    }
}, { once: true });