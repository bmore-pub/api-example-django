from django.shortcuts import redirect
from django.views.generic import TemplateView
from django.views.decorators.csrf import csrf_exempt
from social_django.models import UserSocialAuth

from drchrono.endpoints import AppointmentEndpoint, DoctorEndpoint
from django.http import JsonResponse, QueryDict
from datetime import datetime
from drchrono.models import PatientWaiting
import json

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

class SetupView(TemplateView):
    """
    The beginning of the OAuth sign-in flow. Logs a user into the kiosk, and saves the token.
    """
    template_name = 'kiosk_setup.html'

class DoctorWelcome(TemplateView):
    """
    The doctor can see what appointments they have today.
    """
    template_name = 'doctor_welcome.html'

    def make_api_request(self):
        """
        Use the token we have stored in the DB to make an API request and get doctor details. If this succeeds, we've
        proved that the OAuth setup is working
        """
        # We can create an instance of an endpoint resource class, and use it to fetch details
        access_token = get_token(self.request)
        api = DoctorEndpoint(access_token)
        # Grab the first doctor from the list; normally this would be the whole practice group, but your hackathon
        # account probably only has one doctor in it.
        return next(api.list())

    def get_appointment_details(self, doctor_id):
        access_token = get_token(self.request)
        api = AppointmentEndpoint(access_token)
        return api.list({'doctor': doctor_id}, '2020-01-24')

    def get_context_data(self, **kwargs):
        kwargs = super(DoctorWelcome, self).get_context_data(**kwargs)
        # Hit the API using one of the endpoints just to prove that we can
        # If this works, then your oAuth setup is working correctly.
        doctor_details = self.make_api_request()
        kwargs['doctor'] = doctor_details
        doctor_id = doctor_details.get('id')
        appointment_details = self.get_appointment_details(doctor_id)
        kwargs['appointments'] = appointment_details
        return kwargs

def data_endpoint(request):
  time_waiting = PatientWaiting.average_wait_time()
  data = {
    'time_waiting': time_waiting
  }
  return JsonResponse(data, safe=False)

def hook_endpoint(request):
  # detect event
  event = 'APPOINTMENT_CREATE'
  event = 'APPOINTMENT_MODIFY'

  obj = {
    'patient_id': 123,
    'appointment_id': 789,
    'time_waiting': 12345
  }

  waiting_query = PatientWaiting.objects.filter(**obj)
  if waiting_query.count() > 0:
    print 'hereereeere'
    abc = obj.get('time_waiting')
    waiting_query.update(time_waiting=abc)
  else:
    print 'filter failed'
    patient_waiting = PatientWaiting(**obj)
    patient_waiting.save()

  if event == 'APPOINTMENT_CREATE':
    print event
  elif  event == 'APPOINTMENT_UPDATE':
    print event

  return JsonResponse({'message': len(PatientWaiting.objects.all())}, safe=False)

def get_doctor_data(request):
    access_token = get_token(request)
    doctors = DoctorEndpoint(access_token)
    doctor_details = next(doctors.list())
    return JsonResponse(doctor_details, safe=False)

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
