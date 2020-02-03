from django.shortcuts import redirect
from django.views.generic import TemplateView
from django.views.decorators.csrf import csrf_exempt
from social_django.models import UserSocialAuth

from drchrono.endpoints import AppointmentEndpoint, DoctorEndpoint
from django.http import JsonResponse, QueryDict
from datetime import datetime
from drchrono.models import PatientWaiting, AppointmentStatusChange
from django.conf import settings
from channels import Group
from datetime import datetime

import json
import hashlib, hmac

def get_token(request):
    """
    Social Auth module is configured to store our access tokens. This dark magic will fetch it for us if we've
    already signed in.
    """
    oauth_provider = UserSocialAuth.objects.get(user=request.user, provider='drchrono')
    access_token = oauth_provider.extra_data['access_token']
    return access_token

class ReactView(TemplateView):
    """
    The beginning of the OAuth sign-in flow. Logs a user into the kiosk, and saves the token.
    """
    template_name = 'main.html'

    def get_context_data(self, **kwargs):
        # TODO refactor - blocking unauthed requests
        access_token = get_token(self.request)
        doctors = DoctorEndpoint(access_token)
        doctor_details = next(doctors.list())
        kwargs['js_link'] = settings.JS_SRC
        return kwargs

class SetupView(TemplateView):
    """
    The beginning of the OAuth sign-in flow. Logs a user into the kiosk, and saves the token.
    """
    template_name = 'kiosk_setup.html'

def data_endpoint(request):
    # TODO clean up
    access_token = get_token(request)
    doctors = DoctorEndpoint(access_token)
    doctor_details = next(doctors.list())
    doctor_id = doctor_details['id']
    time_waiting = PatientWaiting.average_wait_time(doctor_id)
    data = {
        'time_waiting': time_waiting
    }
    return JsonResponse(data, safe=False)

@csrf_exempt
def hook_endpoint(request):
    if request.method == 'GET':
        return JsonResponse(webhook_verify(request))

    valid_token = False
    if check_hook_token(request) != True:
      return JsonResponse({
          'block': 'block'
      })

    # detect event
    event = request.META['HTTP_X_DRCHRONO_EVENT']

    # only listen to create and update
    # otherwise, ack
    if event != 'APPOINTMENT_CREATE' and event != 'APPOINTMENT_MODIFY':
        return JsonResponse({'message': 'ack'})

    parsed_body = json.loads(request.body)
    data = parsed_body['object']
    event_created_at = data['updated_at']
    doctor_id = data['doctor']

    # send message
    Group('doctor-drch-grp-' + str(doctor_id)).send({'text': json.dumps({'event': event, 'data': data})})

    # create appointment status change
    AppointmentStatusChange.create_appointment_status(event, event_created_at, data)

    return JsonResponse({'message': 'ack'})

def get_doctor_data(request):
    access_token = get_token(request)
    doctors = DoctorEndpoint(access_token)
    doctor_details = next(doctors.list())
    formatted_details = {
        'first_name': doctor_details.get('first_name'),
        'last_name': doctor_details.get('last_name'),
    }
    return JsonResponse(formatted_details)

def get_appointment_data(request):
    access_token = get_token(request)
    doctors = DoctorEndpoint(access_token)
    doctor_details = next(doctors.list())
    doctor_id = doctor_details.get('id')
    api = AppointmentEndpoint(access_token)
    date_for_query = datetime.today().strftime('%Y-%m-%d')
    appointments = api.list({'doctor': doctor_id}, date_for_query)

    # mapped_data = for item in appointments
    data_to_return = []
    for appointment in appointments:
        data_to_return.append(appointment)

    return JsonResponse(data_to_return, safe=False)

# TODO handle csrf
@csrf_exempt
def update_appointment(request):
    access_token = get_token(request)
    data = json.loads(request.body)
    appointment_id = data.get('appointment_id')
    status = data.get('status')
    api = AppointmentEndpoint(access_token)
    test = api.update(appointment_id, {'status': status})
    return JsonResponse({'message': 'success'}, safe=False)

def check_hook_token(request):
    if settings.WEBHOOK_SECRET_TOKEN is None or settings.WEBHOOK_SECRET_TOKEN == '' or request.META['HTTP_X_DRCHRONO_SIGNATURE'] != settings.WEBHOOK_SECRET_TOKEN:
        return False
    else:
      return True

def webhook_verify(request):
    secret_token = hmac.new(settings.WEBHOOK_SECRET_TOKEN, request.GET['msg'], hashlib.sha256).hexdigest()

    return {
        'secret_token': secret_token
    }
