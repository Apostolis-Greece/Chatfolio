
from django.shortcuts import render

def termsAndConditions_view(request):
    return render(request, 'terms-and-conditions.html')