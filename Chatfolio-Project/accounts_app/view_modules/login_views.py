
from django.shortcuts import render
from django.shortcuts import redirect
from django.contrib.auth import login
from django.views.decorators.csrf import ensure_csrf_cookie
import json
import time # for testing lazy load
from django.http import JsonResponse

from .login_forms import LoginForm
from .utils import extractErrorMessageFromJsonObject

'''
    login_view:  Χειρίζεται Ασύγχρονα POST Requests που προέρχονται από <form id="login-form"> και έχουν
                  document.getElementById('login-form').addEventListener('submit'), {...}

                  Η όψη αυτή είναι υβριδική:
                     α) Σε HTTP GET σερβίρει html
                     β) Σε JSON POST σερβίρει JSON
'''
#@ensure_csrf_cookie # εξεσφαλίζω ότι το csrf_cookie υπάρχει
def login_view(request):
    if request.method == 'POST':
        try:
            time.sleep(2) # for testing lazy load
            #raise json.JSONDecodeError("Invalid JSON data", doc="", pos=0) # for testing
            email, password = extract_login_data(request)
            form = LoginForm(data={'email': email, 'password': password})

            if form.is_valid():
                login(request, form.user) # Φτιάχνω: α) το session και β) το session cookie

                '''
                Προσοχή: Μετά από HTTP POST Request πρέπει να κάνω redirect και να σερβίρω GET
                         ώστε αν ο χρήστης κάνει reload να μη γίνει διπλό HTTP POST Request
                         και δημιουργηθεί σοβαρό πρόβλημα στην Database.

                         Λύση: Aνακατεύθυνση (HTTP 302) κάνοντας κανούργιο HTTP GET στη σελίδα chat.html
                               Άρα, αν γίνει εσκεμμένα ή καταλάθος διπλό Request,
                               τότε θα είναι HTTP POST /login -> HTTP GET /chat και όχι διπλό HTTP POST /login.

                            render:  θα κάνει GET το chat αλλα ο browser θα γραφει domain/login
                            redirect:  θα κάνει GET το chat και ο browser θα γράφει domain/chat
                
                        Εδώ έχουμε JSON POST Request και δεν υπάρχει κίνδυνος για κάτι τέτοιο.
                        Το redirect θα το κάνει η JavaScript μέσω της href ή καλύτερα της replace().
                '''
                return JsonResponse({'status': 'success'})
            else:
                errorMessage = extractErrorMessageFromJsonObject(form)
                return JsonResponse({'status': 'error', 'message': errorMessage})

        except json.JSONDecodeError:
            errorMessage = 'Invalid JSON data'
            return JsonResponse({'status': 'error', 'message': errorMessage})

    # HTTP GET Request
    else:
        form = LoginForm()

    return render(request, 'login.html')




################################################ Functions
def extract_login_data(request):
    body = json.loads(request.body)
    email = body.get('email')
    password = body.get('password')
    return email, password