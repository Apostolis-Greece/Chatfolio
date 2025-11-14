
from django.shortcuts import render
from django.shortcuts import redirect
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import ensure_csrf_cookie
import json
import time # for testing transactions
from django.http import JsonResponse
from django.db import transaction
from django.conf import settings
import os, shutil

User = get_user_model()
from .register_forms import RegisterForm
from .utils import extractErrorMessageFromJsonObject


'''
    Η όψη αλλάζει τη βάση δεδομένων. Άρα, πρέπει να γίνει μια ατομική εντολή και αν χρειαστεί rollback
        Λύση 1: @transaction.atomic  -->  Σε ολόκληρη την register_view
        Λύση 2: with transaction.atomic():  -->  Μόνο στον απολύτως απαραίτητο κώδικα
                                                 Έτσι, δεν επιβαρύνω χωρίς λόγο το user experience
'''
#@ensure_csrf_cookie # εξεσφαλίζω ότι το csrf_cookie υπάρχει
def register_view(request):
    if request.method == 'POST':
        time.sleep(5) # for testing transactions and lazy load
        try:
            #raise json.JSONDecodeError("Invalid JSON data", doc="", pos=0) # for testing
            email, password, confirm, country = extract_register_data(request)
            form = RegisterForm(data={'email': email, 'password': password, 'confirm': confirm, 'country': country})

            if form.is_valid():
                #raise Exception("") # for testing
                return register_atomic(form)
            else:
                errorMessage = extractErrorMessageFromJsonObject(form)
                return JsonResponse({'status': 'error', 'message': errorMessage})
            
        except json.JSONDecodeError:
            errorMessage = 'Invalid JSON data'
            return JsonResponse({'status': 'error', 'message': errorMessage})
        
    # HTTP GET Request
    else:
        form = RegisterForm()
        return render(request, 'register.html')




################################################ Functions
# Εξάγω τα δεδομένα του HTTP POST
def extract_register_data(request):
    body = json.loads(request.body)
    email = body.get('email')
    password = body.get('password')
    confirm = body.get('confirm')
    country = body.get('country')
    return email, password, confirm, country


# Εξάγω τα καθαρά δεδομένα του HTTP POST, δηλ. αυτά που πέρασαν από τον έλεγχο του register_forms.py
def extract_register_cleaned_data(form):
    email = form.cleaned_data['email']
    password = form.cleaned_data['password']
    username = email.split('@')[0]
    country = form.cleaned_data.get('country')
    return email, password, username, country


# Part 1/3: Αυτή η συνάρτηση είναι μέρος μιας ατομικής εντολής και γράφει έναν νέο χρήστη στην Database
def register_create_user(email, password, username, country):
    user = User.objects.create_user(username=username, email=email, password=password, country=country)
    print(f"\tPart 1/3 (OK): User with email '{email}' is written into the database")
    return user


# Part 2/3: Αυτή η συνάρτηση είναι μέρος μιας ατομικής εντολής και δημιουργεί media folder για έναν νέο χρήστη στο File System
def register_create_media_folder(user, email):
    user_folder = f"user_{user.id}"
    folder_path = os.path.join(settings.MEDIA_ROOT, user_folder)
    os.makedirs(folder_path, exist_ok=True)
    print(f"\tPart 2/3 (OK): Media folder '{folder_path}' is assigned to the email '{email}'")
    return user_folder, folder_path


# Rollback Part 2/3 και 3/3: Αυτή η συνάρτηση είναι μέρος μιας ατομικής εντολής και διαγράφει το media folder για έναν νέο χρήστη στο File System
def register_delete_media_folder(user):
    user_folder = f"user_{user.id}"
    folder_path = os.path.join(settings.MEDIA_ROOT, user_folder)

    try:
        if os.path.exists(folder_path):
            shutil.rmtree(folder_path)
            print(f"\tRollback (OK): Media folder '{folder_path}' is deleted")
        else:
            print(f"\tRollback (OK): Media folder '{folder_path}' does not exist")
    
    except Exception as e:
        print(f"\tError: Media folder '{folder_path}' is not deleted: {e}")
        # write to a log file


# Part 3/3: Αυτή η συνάρτηση είναι μέρος μιας ατομικής εντολής και δημιουργεί τη default profile photo ενός νέου χρήστη στο File System
def register_create_default_profile_photo(user_folder, folder_path):
    default_photo = os.path.join(settings.STATIC_ROOT, "photos", "default-profile.png")
    user_photo = os.path.join(folder_path, user_folder + ".png")

    if os.path.exists(default_photo):
        shutil.copy(default_photo, user_photo)
        print(f"\tPart 3/3 (OK): Copied {default_photo} → {user_photo}")
    else:
        print(f"\tError: Default profile photo not found at {default_photo}")
        # delete media folder


def register_atomic(form):
    try:
        with transaction.atomic():
            print("\ttransaction.atomic() starts")
            email, password, username, country = extract_register_cleaned_data(form)
            
            user = register_create_user(email, password, username, country) # Atomic 1/3
            user_folder, folder_path = register_create_media_folder(user, email) # Atomic 2/3
            register_create_default_profile_photo(user_folder, folder_path) # Atomic 3/3
            #raise Exception("") # for testing rollback

            '''
            Αυτό χρειάζεται αν έχω κλασικό HTTP POST Request  δηλαδή:  <form method="POST">

                # Θέλω μετά το register να ακολουθεί login
                login(request, user) # Φτιάχνω: α) το session και β) το session cookie

                # Προσοχή: Μετά από POST (πχ login, logout, register) πρέπει να κάνω redirect και να σερβίρω GET
                #          ώστε αν ο χρήστης κάνει reload να μη γίνει διπλό POST και δημιουργηθεί σοβαρό πρόβλημα.
                #          Αν όμως τον ανακατευθύνω κάνοντας κανούργιο GET στην login, τότε και να κάνει
                #          reload, ουσιαστικά θα κάνει GET login και όχι POST register + POST register
                #    render:  θα κάνει GET το login αλλα ο browser θα γραφει domain/register
                #    redirect:  θα κάνει GET το login και ο browser θα γράφει domain/
                return redirect('login_view')

            Στην περίπτωση μας, έχουμε Ασύγχρονο HTTP POST  δηλαδή:  <form id="..."> addEventListener("submit", {...}),
            οπότε δεν υπάρχει κίνδυνος να γίνει εσκεμμένα ή κατά λάθος διπλό POST Request    
            '''
            print("\ttransaction.atomic() ends")
            return JsonResponse({'status': 'success'})
    
    # Αν αποτύχει η ατομικότητα θα γίνει διαδικασία rollback τόσο στην Database όσο και στο Fise System
    except Exception as e:
        print("\ttransaction.atomic() failed")
        print(f"\t{e}")

        # 1. Το Database Rollback γίνεται αυτόματα από το πακέτο transactions
        # 2. Κάνω το Fise System Rollback διαγράφονρας το media folder με τα περιεχμενα του
        register_delete_media_folder(user)
        print(f"\tDatabase and File System Rollback (OK)")

        '''
            Προσοχή: Αν είχα κλασικό HTTP POST θα έπρεπε εδώ να κάνω ανακατεύθυνση σε κάτι GET
                     για να αποφύγω εσκεμμένο ή κατά λάθος διπλό HTTP POST Request
        '''
        errorMessage = 'Something went wrong. Please try again later.'
        return JsonResponse({'status': 'error', 'message': errorMessage})