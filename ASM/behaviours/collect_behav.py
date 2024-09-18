import jsonpickle
from spade.behaviour import PeriodicBehaviour
from utils.crypto_info import get_market_data
from utils.data import Data
from utils.log import Log
from utils.env import XMPP_SERVER
from spade.message import Message

class CollectBehaviour(PeriodicBehaviour):
    async def on_start(self):
        Log.log(str(self.agent.jid).partition('@')[0], "starting collector behaviour...")

    async def run(self):
        msg = Message(to=f"manager@{XMPP_SERVER}")
        msg.set_metadata("performative", "collector_inform")

        data = get_market_data(self.agent.crypto)

        coinid = data["id"]
        name = data["name"]
        price = data["quote"]["USD"]["price"]
        volume = data["quote"]["USD"]["volume_24h"]
        marketcap = data["quote"]["USD"]["market_cap"]

        msg.body = jsonpickle.encode(Data(coinid, name, price, volume, marketcap))

        await self.send(msg)