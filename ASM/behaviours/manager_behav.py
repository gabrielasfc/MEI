import jsonpickle
import datetime
from spade.behaviour import CyclicBehaviour
from spade.message import Message
from agents.collector import CollectorAgent
from utils.asset import Asset
from utils.trade import Trade
from utils.history import History
from utils.log import Log
from utils.env import XMPP_SERVER, PASSWORD


class ManagerBehaviour(CyclicBehaviour):
    async def on_start(self):
        Log.log(str(self.agent.jid).partition('@')[0], "starting manager behaviour...")

    async def run(self):        
        msg = await self.receive(timeout=10)

        if msg:
            data = jsonpickle.decode(msg.body)
            
            performative = msg.get_metadata("performative")

            Log.log(str(self.agent.jid).partition('@')[0], f"{performative} received")

            if performative == "call_inform":
                msg = Message(to=f"mapper@{XMPP_SERVER}")
                msg.set_metadata("performative", "request")
                msg.body = jsonpickle.encode(data)

                await self.send(msg)
            
            elif performative == "collector_inform":
                coinid = data.coinid
                price = data.price

                # Atualizar o preço
                if self.agent.portfolio[coinid].quantity is not None:
                    self.agent.portfolio[coinid].update(price)

            elif performative == "mapper_confirm":
                # Se não estiver no portfólio então compra
                coinid = data.coinid
                name = data.name

                if coinid not in self.agent.portfolio:
                    self.agent.portfolio[coinid] = Asset(coinid, name)

                    msg = Message(to=f"broker@{XMPP_SERVER}")
                    msg.set_metadata("performative", "buy_request")

                    trade = Trade(coinid, balance=self.agent.trade_balance)
                    msg.body = jsonpickle.encode(trade)

                    await self.send(msg)

            elif performative == "mapper_failure":
                pass

            elif performative == "buy_confirm":
                # Dar trigger a um agente collector e enviar mensagem ao broker pra comprar
                coinid = data.coinid
                
                collector = CollectorAgent(f"{coinid}_collector@{XMPP_SERVER}", PASSWORD)
                collector.crypto = coinid

                self.agent.collectors[coinid] = collector

                await collector.start(auto_register=True)

                timestamp = datetime.datetime.now().strftime('%d-%m-%Y %H:%M')
                history = History(timestamp, "Buy", self.agent.portfolio[coinid].name, data.quantity, data.price, self.agent.balance)
            
                self.agent.balance -= data.balance
                self.agent.portfolio[coinid].set_info(data.price, data.quantity)
                self.agent.history.append(history)
            
            elif performative == "buy_failure":
                coinid = data.coinid

                del self.agent.portfolio[coinid]

            elif performative == "sell_confirm":
                coinid = data.coinid
                self.agent.balance += data.balance

                timestamp = datetime.datetime.now().strftime('%d-%m-%Y %H:%M')
                history = History(timestamp, "Sell", self.agent.portfolio[coinid].name, data.quantity, data.price, self.agent.balance)

                await self.agent.collectors[coinid].stop()
                del self.agent.collectors[coinid]
                del self.agent.portfolio[coinid]
                self.agent.history.append(history)

            elif performative == "sell_failure":
                pass
