
import json

'''
    Αυτή η συνάρτηση παίρνει τα σφάλματα του forms.py και να μετατρέπει σε string
    ώστε στο popup-errors του front-end να εμφανίσω κάτι όμορφο για καλό user experience
    και όχι τα σφάλματα σε μορφή JSON Object 
'''
def extractErrorMessageFromJsonObject(form):
    errorJsonObject = form.errors.as_json()
    #print(f"\t{errorJsonObject}")

    errorDictionary = json.loads(errorJsonObject)
    #print(f"\t{errorDictionary}")

    errorMessages = [
        error["message"]
        for field_errors in errorDictionary.values()
        for error in field_errors
    ]
    print(f"\t{errorMessages}")
    return errorMessages