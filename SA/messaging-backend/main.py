from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, messaging
import time

app = Flask(__name__)

cred = credentials.Certificate("./elderwatch-d8c06-firebase-adminsdk-hsyix-b32a034149.json")
firebase_admin.initialize_app(cred)

@app.route('/send', methods=['POST'])
def send_notification():
    try:
        data = request.json
        token = data['token']
        title = data['title']
        body = data['body']

        message = messaging.Message(
            token=token,
            android=messaging.AndroidConfig(
                priority='high',
                notification=messaging.AndroidNotification(
                    title=title,
                    body=body
                )
            )
        )
        print(token)
        response = messaging.send(message)
        return jsonify({"success": True, "message_id": response}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
