import jsonpickle
from spade.behaviour import CyclicBehaviour
from spade.message import Message
from utils.crypto_info import get_coinid
from utils.log import Log

class MapBehaviour(CyclicBehaviour):
    async def on_start(self):
        Log.log(str(self.agent.jid).partition('@')[0], "starting mapping behaviour...")

    async def run(self):
        msg = await self.receive(timeout=10)
        
        if msg:
            data = jsonpickle.decode(msg.body)
            
            performative = msg.get_metadata("performative")

            Log.log(str(self.agent.jid).partition('@')[0], f"{performative} received")
            
            if performative == "request":
                coin = get_coinid(data.ticker)

                if coin:
                    data.coinid = coin[0]
                    data.name = coin[1]

                    reply = Message(to=str(msg.sender))
                    reply.set_metadata("performative", "mapper_confirm")
                    reply.body = jsonpickle.encode(data)

                    await self.send(reply)
                else:
                    reply = Message(to=str(msg.sender))
                    reply.set_metadata("performative", "mapper_failure")
                    reply.body = jsonpickle.encode(data)

                    await self.send(reply)



            