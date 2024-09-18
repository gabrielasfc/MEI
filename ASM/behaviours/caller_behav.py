import requests
import re
import jsonpickle
from datetime import datetime
from spade.behaviour import PeriodicBehaviour
from spade.message import Message
from utils.call import Call
from utils.log import Log
from utils.env import XMPP_SERVER

class CallerBehaviour(PeriodicBehaviour):
    async def on_start(self):
        Log.log(str(self.agent.jid).partition('@')[0], "starting caller behaviour...")

    async def run(self):
        response = requests.get(f'http://127.0.0.1:5000/tweets/{self.agent.user}')

        if response.status_code == 200:
            data = response.json()

            date1 = datetime.strptime(data["date"], "%d/%m/%Y %H:%M:%S")

            if "date" in self.agent.last_tweet:
                date2 = datetime.strptime(self.agent.last_tweet["date"], "%d/%m/%Y %H:%M:%S")
            else:
                date2 = None

            if date2 is None or date1 > date2:
                if self.agent.first_time:
                    self.agent.last_tweet["tweet"] = data["text"]
                    self.agent.last_tweet["date"] = data["date"]
                    self.agent.first_time = False
                else:
                    self.agent.last_tweet["tweet"] = data["text"]
                    self.agent.last_tweet["date"] = data["date"]

                    match = re.search(r'\$(\w+)\b', data["text"])

                    if match is not None:
                        msg = Message(to=f"manager@{XMPP_SERVER}")
                        msg.set_metadata("performative", "call_inform")
                        
                        call = Call(match.group(1))
                        msg.body = jsonpickle.encode(call)

                        await self.send(msg)
                    else:
                        print("Ticker not found")
        else:
            print('Request error:', response.status_code)