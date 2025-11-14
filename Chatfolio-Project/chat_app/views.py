
from django.shortcuts import render
from django.conf import settings
import os
#from django.contrib.auth.decorators import login_required


#@login_required
def chat_view(request):
    email = request.user.email
    country = request.user.country

    userData = {
        "email": email,
        "country": "" if country is None else country,
        "profile_image": get_user_profile_image(request.user)
    }
    print(f"\t{userData}")
    return render(request, 'chat.html', userData)


'''
    Ελέγχω αν ο χρήστης έχει ανεβάσει δική του φωτογραφία ή όχι
    Αν ναί, θα την αναζητήσω από το δικό του media folder
    Αν όχι, θα την αναζητήσω από τον φάκελο static
'''
def get_user_profile_image(user):
    if not user.profile_image or not os.path.exists(user.profile_image.path):
        return settings.STATIC_URL + 'photos/default-profile.png'
    else:
        return user.profile_image.url