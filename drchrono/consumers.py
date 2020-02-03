from channels import Group
from channels.auth import http_session_user, channel_session_user, channel_session_user_from_http
from social_django.models import UserSocialAuth
from drchrono.endpoints import DoctorEndpoint

def get_doctor_id(user):
    oauth_provider = UserSocialAuth.objects.get(user=user, provider='drchrono')
    access_token = oauth_provider.extra_data['access_token']
    doctors = DoctorEndpoint(access_token)
    doctor_details = next(doctors.list())
    return doctor_details['id']

def get_group(user):
  return 'doctor-drch-grp-' + str(get_doctor_id(user))

@channel_session_user_from_http
def ws_connect(message):
    # Accept the incoming connection
    message.reply_channel.send({"accept": True})
    group = get_group(message.user)
    Group(group).add(message.reply_channel)
    Group(group).send({'text': group})

# @channel_session_user
# def ws_receive(message):
#     label = message.channel_session['doctor']
#     data = json.loads(message['text'])
#     group = get_group(message.user)
#     Group(group).send({'text': group})

@channel_session_user
def ws_disconnect(message):
    group = get_group(message.user)
    Group(group).discard(message.reply_channel)