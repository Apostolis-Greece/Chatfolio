
from django.shortcuts import redirect, render
from django.urls import reverse, NoReverseMatch
from django.conf import settings
from django.http import HttpResponseForbidden
import os

'''
Κάθε HTTP Request παιρνάει πρώτα από το loginRequired_middleware.py για έλεγχο εξουσιοδότησης.
Αν περάσουν τον έλεγχο εξουσιοδότησης, τότε τα HTTP Requests στέλνονται στα κατάλληλα views.

Ασφαλίζω ΟΛΑ τα URLs του chat_app από μη εξουσιοδοτημένη πρόσβαση απαιτώντας login.
Η σελίδα chat.html θα σερβιριστεί μόνο αν ο χρήστης είναι συνδεδεμένος.
Αλλιώς, θα ανακατευθυνθεί στη σελίδα LOGIN_URL από το settings.py.

  Παράδειγμα
      HTTP GET Request chat/  -->  HTTP Response 302  -->  /login/?next=/chat/
      δηλ. εγώ ζητάω το chat/ και ο server με ανακατευθύνει στο login/
      όπου μόλις κάνω επιτυχώς login θα μου σερβίρει το chat/

  Λύση 1: @login_required def ... σε κάθε view που θέλω να προστατεύσω

  Λύση 2: login_required(...) σε κάθε URL που θέλω να προστετεύσω

  Λύση 3: Δημιουργία Middleware που θα ασφαλίζει όλα τα views ενός app
          Η συνάρτηση reverse(alias_url) ψάχνει στο urls.py να βρει τα  αντίστοιχα view και URL.
          Όμως, η reverse(alias_url) θα πετάξει HTTP 500 Error αν:
              α) Έχω ξεχάσει να βάλω το alias_url στο urls.py ή το έχω γράψει λάθος
              β) Η reverse() βασίζεται σε URLs που απαιτούν κάποια παράμετρο (π.χ. /?=...).

          Γενικά, υπάρχουν πάρα πολλά τέτοια URLs μέσα σε μια ιστοσελίδα.
              πχ ενώ ασφαλίζω το alias_url="chat/" και νομίζω ότι όλα είναι μια χαρά,
                 ο χρήστης κάνει HTTP GET "chat/?=profile-image"

          Λύση: Με το startswith('chat_view') προστατεύουμε και κάθε URL που περιέχει παραμέτρους
          Λύση: Κάνω το middleware να ελέγχει με try-except αν το HTTP GET URL υπάρχει πριν κληθεί
                η reverse και αν δεν υπάρχει τέτοιο URL, τότε το except θα κάνει ανακατεύθυνση
                δηλ. HTTP 302 στο login.html
'''
class LoginRequiredMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Προέλεγχος του URL ώστε αν δεν υπάρχει να μην γίνει HTTP 500 αλλά ανακατεύθυνση στο login_URL
        try:
            reverse('chat_view')
        except NoReverseMatch:
            print(f"\tError: name='chat_view' is not matched with a url")

        # Έλεγχος μη εξουσιοδοτημένης πρόσβασης σε URL του chat_app
        if not request.user.is_authenticated and request.path.startswith('/chat/'):
            print(f"\tLoginRequired_middleware.py: {request.user} is not authorized to access a '{request.build_absolute_uri()}'")
            return redirect('login_view')
 
        # Έλεγχος μη εξουσιοδοτημένης πρόσβασης σε media file
        if request.path.startswith(settings.MEDIA_URL):
            relative_path = request.path[len(settings.MEDIA_URL):].strip('/')

            # Αν δεν υπάρχει τίποτα μετά το /media/ ή τελειώνει σε /
            if not relative_path or relative_path.endswith('/'):
                print(f"\tLoginRequired_middleware.py: {request.user} is not authorized to access a '{request.build_absolute_uri()}'")
                return render(request, "404.html", status=404)

            # Κάνουμε split μόνο για να πάρουμε τον πιθανό owner
            parts = relative_path.split('/')
            owner = parts[0] if len(parts) > 1 else None  # None αν δεν υπάρχει υποφάκελος
            print(f"\towner: {owner}")
            print(f"\tuser: {"user_" + str(request.user.id)}")

            if owner == None:
                return render(request, "404.html", status=404)
            
            # Αν είναι staff ή superuser → πλήρης πρόσβαση (μόνο σε files)
            elif request.user.is_staff or request.user.is_superuser:
                print(f"\t[MEDIA] Admin/staff access granted to {request.path}")
                return self.get_response(request)

            # Αν είναι απλός χρήστης → πρέπει να είναι ο owner
            elif ("user_" + str(request.user.id)) != owner:
                print(f"\t[MEDIA] {request.user.username} tried to access another user's media: {owner}")
                return render(request, "404.html", status=404)

            # Αν είναι owner → επιτρέπεται (μόνο σε files)
            else:
                print(f"\t[MEDIA] Access granted to owner {request.user.username} for file {request.path}")
            
        return self.get_response(request)