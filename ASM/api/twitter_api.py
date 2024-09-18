from flask import Flask, jsonify
from twitter.scraper import Scraper
from datetime import datetime

## sign-in with credentials
scraper = Scraper("", "", "")

app = Flask(__name__)

@app.route('/tweets/<user>')
def get_tweets(user):
    try:
        users = scraper.users([user])
        userid = users[0]["data"]["user"]["result"]["rest_id"]
        tweets = scraper.tweets([userid], limit=1)
        
        entries = None

        for timeline in tweets[0]["data"]["user"]["result"]["timeline_v2"]["timeline"]["instructions"]:
            if timeline["type"] == "TimelineAddEntries":
                entries = timeline

        if entries is not None and "itemContent" in entries["entries"][0]["content"]:
            text = entries["entries"][0]["content"]["itemContent"]["tweet_results"]["result"]["legacy"]["full_text"]
            date = datetime.strptime(entries["entries"][0]["content"]["itemContent"]["tweet_results"]["result"]["legacy"]["created_at"], '%a %b %d %H:%M:%S %z %Y')
            formatted_date = date.strftime('%d/%m/%Y %H:%M:%S')

            tweet = {"text": text, "date": formatted_date}
            return jsonify(tweet)

        else:
            return jsonify({"error": "Tweet não encontrado"}), 400

    except Exception as e:
        print(f"Um erro ocorreu: {e}")

        return jsonify({"error": "Tweet não encontrado"}), 400

@app.route('/trends')
def get_trends():
    trends = scraper.trends()
    return jsonify(trends)


if __name__ == '__main__':
    app.run(debug=True)
