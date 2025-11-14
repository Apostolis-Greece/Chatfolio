
from django.shortcuts import render


def forgotPassword_view(request):
    return render(request, 'forgot-password.html')