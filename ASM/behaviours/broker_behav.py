import jsonpickle
import random
from spade.behaviour import CyclicBehaviour
from spade.message import Message
from utils.log import Log
from utils.crypto_info import get_market_data

class BrokerBehaviour(CyclicBehaviour):
    async def on_start(self):
        Log.log(str(self.agent.jid).partition('@')[0], "starting broker behaviour...")

    async def run(self):
        msg = await self.receive(timeout=10)

        if msg:
            data = jsonpickle.decode(msg.body)

            performative = msg.get_metadata("performative")

            Log.log(str(self.agent.jid).partition('@')[0], f"{performative} received")
   
            if performative == "buy_request":
                prob = random.random()

                if prob < 0.9:
                    # NA REALIDADE TERÍAMOS DE USAR A API DE UMA CEX/DEX E COMPRAR -> VAMOS USAR UMA SIMULAÇÃO
                    coin_data = get_market_data(data.coinid)

                    price = coin_data["quote"]["USD"]["price"]
                    quantity = data.balance / price
                        
                    data.price = price
                    data.quantity = quantity
                    data.balance = price * quantity

                    reply = Message(to=str(msg.sender)) 
                    reply.set_metadata("performative", "buy_confirm") 
                    reply.body = jsonpickle.encode(data)
                    
                    await self.send(reply)
                else:
                    reply = Message(to=str(msg.sender))
                    reply.set_metadata("performative", "buy_failure")
                    reply.body = jsonpickle.encode(data)

                    await self.send(reply)
            
            elif performative == "sell_request":
                prob = random.random()

                #if prob < 0.9:
                    # NOVAMENTE UMA SIMULAÇÃO
                coin_data = get_market_data(data.coinid)

                price = coin_data["quote"]["USD"]["price"]
                balance = data.quantity * price

                data.price = price
                data.balance = balance

                msg = Message(to=str(msg.sender)) 
                msg.set_metadata("performative", "sell_confirm") 
                msg.body = jsonpickle.encode(data)
                
                await self.send(msg)
                #else:
                #    reply = Message(to=str(msg.sender))
                #    reply.set_metadata("performative", "sell_failure")
                #    reply.body = jsonpickle.encode(data)

                #    await self.send(reply)
