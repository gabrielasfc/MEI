import gspread
from oauth2client.service_account import ServiceAccountCredentials
import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd

ewjson = 'looker/elderwatch.json'

# Firebase
cred = credentials.Certificate(ewjson)
firebase_admin.initialize_app(cred)

db = firestore.client()
users_ref = db.collection('users')

#Google Sheet
scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
creds = ServiceAccountCredentials.from_json_keyfile_name(ewjson, scope)
client = gspread.authorize(creds)
sheet = client.open_by_key('1dcTkeCoR_q_hxA8Y9Ds3-qB7FMAzwvD0oUTsHW_mcLs').sheet1 
sheet.clear()


data = []
docs = users_ref.stream()

for doc in docs:
    user_data = doc.to_dict()  
    user_activities = user_data.get('activities', [])  
    for activity in user_activities:
        fall = activity.get('fall')
        timestamp = activity.get('timestamp')
        timestamp_str = timestamp.strftime('%Y-%m-%d %H:%M:%S')
        if fall is not None and timestamp is not None:
            timestamp_str = timestamp.strftime('%Y-%m-%d %H:00:00')  # Arredonda para a hora mais próxima 
            data.append({'fall': fall, 'hour_interval': timestamp_str})


df = pd.DataFrame(data)


sheet.update([df.columns.values.tolist()] + df.values.tolist())

print("Data extracted successfully!")
