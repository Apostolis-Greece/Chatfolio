

from django.shortcuts import render
from django.shortcuts import redirect
from django.contrib.auth import logout
from django.views.decorators.csrf import ensure_csrf_cookie
import time # for testing lazy load


#@ensure_csrf_cookie # εξεσφαλίζω ότι το csrf_cookie υπάρχει (πχ σε HTTP POST μέσω JavaScript, Ajax κλπ)
def logout_view(request):
    time.sleep(2)
    logout(request) # Διαγράφω: α) το session και β) ακυρώνω session cookie

    '''
        Προσοχή: Μετά από POST (πχ login, logout, register) πρέπει να κάνω redirect και να σερβίρω GET
                  ώστε αν ο χρήστης κάνει reload να μη γίνει διπλό POST και δημιουργηθεί σοβαρό πρόβλημα.
                 Αν όμως τον ανακατευθύνω κάνοντας κανούργιο GET στην homepage, τότε και να κάνει
                  reload, ουσιαστικά θα κάνει GET homepage και όχι POST logout + POST logout
      
                   render:  θα κάνει GET το homepage αλλα ο browser θα γραφει domain/logout
                   redirect:  θα κάνει GET το homepage και ο browser θα γράφει domain/
    '''
    return redirect('homepage_view')
    #return render(request, 'homepage.html')