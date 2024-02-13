import argparse
import threading
import time
import socket
from datetime import datetime
from node import Node
from packets.control_packet import ControlPacket
from utils.server_info import ServerInfo

class RP(Node):
    def __init__(self, bootstrapper, is_bootstrapper=False, file=None, debug_mode=False):        
        self.servers = dict()
        self.servers_lock = threading.Lock()

        self.initial_port = 7778 # a partir daqui incrementa

        super().__init__(bootstrapper, is_bootstrapper=is_bootstrapper, file=file, debug_mode=debug_mode)

        # Services
        threading.Thread(target=self.tracking_service, args=()).start()

    
    def setup(self):
        if self.is_bootstrapper:
            for key, value in self.nodes["nodes"].items():
                if self.bootstrapper[0] in value["interfaces"]: # é esse o servidor
                    self.neighbours = value["neighbours"]
            
            for server in self.nodes["servers"]:
                self.servers[server] = ServerInfo()
        
        else:
            self.control_socket.settimeout(2)
            while True:
                self.control_socket.sendto(ControlPacket(ControlPacket.NEIGHBOURS).serialize(), self.bootstrapper)
                self.logger.info("Setup: Asked for neighbours and servers")

                try:
                    data, _ = self.control_socket.recvfrom(1024)
                    msg = ControlPacket.deserialize(data)

                    if msg.type == ControlPacket.NEIGHBOURS and msg.response == 1:
                        self.neighbours = msg.neighbours

                        for server in msg.servers:
                            self.servers[server] = ServerInfo()
                        
                        self.logger.info("Setup: Neighbours and servers received")
                        self.logger.debug(f"Neighbours: {self.neighbours}")
                        self.logger.debug(f"Servers: {self.servers}")

                        break
                    
                    else:
                        self.logger.info("Setup: Unexpected response received")
                        exit() # É este o comportamento que queremos ?
                    
                except socket.timeout:
                    self.logger.info("Setup: Could not receive response to neighbours and servers request")


    def get_port(self, content):
        port = None

        if content in self.ports:
            port = self.ports[content]
        else:
            port = self.initial_port
            self.ports[content] = port
            self.initial_port += 1

        return port


    def control_worker(self, address, msg):
        # Se tem ciclos
        if address[0] in msg.hops:
            return
        
        if msg.response == 0:
            msg.hops.append(address[0])

        if self.is_bootstrapper and msg.type == ControlPacket.NEIGHBOURS:
            neighbours = list()
            servers = list()

            for key, value in self.nodes["nodes"].items():
                if address[0] in value["interfaces"]: # é esse o servidor
                    neighbours = value["neighbours"]

            if address[0] in self.nodes["rp"]:
                servers = self.nodes["servers"]

            msg = ControlPacket(ControlPacket.NEIGHBOURS, response=1, servers=servers, neighbours=neighbours)
            self.control_socket.sendto(msg.serialize(), address)
            
            self.logger.info(f"Control Service: Neighbours sent to {address[0]}")
            self.logger.debug(f"Message: {msg}")
        
        elif msg.type == ControlPacket.PLAY:
            if msg.nack == 1:
                self.logger.info(f"Control Service: NACK received from {address[0]}")
                self.logger.debug(f"Message received: {msg}")

                content = msg.contents[0]
                
                self.lock.acquire()
                
                self.tree[content]["clients"].remove(address[0])

                self.logger.info(f"Control Service: {address[0]} removed from tree")

                if len(self.tree[content]["clients"]) == 0:
                    self.tree.pop(content)

                self.lock.release()

            elif msg.response == 0:
                self.logger.info(f"Control Service: Subscription received from {address[0]}")
                self.logger.debug(f"Message received: {msg}")


                self.lock.acquire()

                port = self.get_port(msg.contents[0])
                content = msg.contents[0]

                if content not in self.tree:
                    self.tree[content] = dict()
                    self.tree[content]["frame"] = 0
                    self.tree[content]["clients"] = set()
                    self.tree[content]["clients"].add(address[0])

                    self.contacts[address[0]] = float(datetime.now().timestamp())

                    self.logger.info(f"Control Service: Added {address[0]} to tree")

                    msg.response = 1
                    msg.port = port
                    self.control_socket.sendto(msg.serialize(), (address[0], 7777))

                    self.servers_lock.acquire()

                    best_server = None
                    for server, value in self.servers.items():
                        if content in value.contents:
                            if best_server is not None:
                                if best_server[1] > value.metric:
                                    best_server = (server, value.metric)
                            else:
                                best_server = (server, value.metric)

                    self.servers_lock.release()

                    if best_server is not None: #  PROTEGER PRO CASO EM QUE NAO TEM O CONTEUDO
                        self.control_socket.sendto(ControlPacket(ControlPacket.PLAY, port=port, contents=[content]).serialize(), (best_server[0], 7777)) # Proteger para casos em que ainda nao tem best server

                        self.servers[best_server[0]].status = True # Verificar dps

                        self.logger.info(f"Control Service: Streaming request sent to server {best_server[0]}")
                        self.logger.debug(f"Message sent: {msg}")

                        self.lock.release()

                        # LANÇAMOS AQUI UMA THREAD PARA RECEBER A STREAM?
                        threading.Thread(target=self.listen_rtp, args=(port, content)).start()

                else:
                    self.tree[content]["clients"].add(address[0])

                    self.contacts[address[0]] = float(datetime.now().timestamp())

                    self.logger.info(f"Control Service: Added {address[0]} to tree")

                    msg.response = 1
                    msg.port = port
                    self.control_socket.sendto(msg.serialize(), (address[0], 7777))

                    self.logger.info(f"Control Service: Confirmation sent to {address[0]}")
                    self.logger.debug(f"Message sent: {msg}")

                    self.lock.release()
        
        elif msg.type == ControlPacket.LEAVE:
            self.logger.info(f"Control Service: Leave received from {address[0]}")
            self.logger.debug(f"Message received: {msg}")
        
            
            self.lock.acquire()

            content = msg.contents[0]
            if content in self.tree:
                self.tree[content]["clients"].remove(address[0])

                self.logger.info(f"Control Service: Client {address[0]} removed from tree")

                if len(self.tree[content]["clients"]) == 0:
                    self.tree.pop(content)

                    self.servers_lock.acquire()
                    for server, info in self.servers.items():
                        if info.status and content in info.contents:
                            self.control_socket.sendto(msg.serialize(), (server, 7777))
                            info.status = False

                            self.logger.info(f"Control Service: Leave message sent to {server}")
                            self.logger.debug(f"Message sent: {msg}")

                    self.servers_lock.release()

            self.lock.release()
        
        elif msg.type == ControlPacket.POLLING:
            self.logger.info(f"Control Service: Polling received from neighbour {address[0]}")
            self.logger.debug(f"Message received: {msg}")

            if msg.alive == 1:
                self.lock.acquire()
                self.contacts[address[0]] = float(datetime.now().timestamp())
                self.lock.release()

            elif msg.nack == 1:                
                self.logger.info(f"Control Service: NACK received from {address[0]}")
                self.logger.debug(f"Message received: {msg}")       

                content = msg.contents[0]
                
                self.lock.acquire()
                
                if address[0] in self.tree[content]["clients"]:
                    self.tree[content]["clients"].remove(address[0])
                    self.logger.info(f"Control Service: {address[0]} removed from tree")

                    if len(self.tree[content]["clients"]) == 0:
                        self.tree.pop(content)

                self.lock.release()
                
            elif msg.response == 0:
                self.logger.info(f"Control Service: Subscription received from {address[0]}")
                self.logger.debug(f"Message received: {msg}")

                self.lock.acquire()

                if msg.contents[0] in self.tree:
                    self.tree[msg.contents[0]]["clients"].add(address[0]) 

                    self.contacts[address[0]] = float(datetime.now().timestamp())

                    self.logger.info(f"Control Service: Added {address[0]} to tree")

                self.lock.release()

                msg.response = 1
                msg.port = self.ports[msg.contents[0]]
                self.control_socket.sendto(msg.serialize(), (address[0], 7777))

                self.logger.info(f"Control Service: Confirmation sent to {address[0]}")
                self.logger.debug(f"Message sent: {msg}")
 
       

    def pruning_service(self):
        wait = 3

        while True:
            time.sleep(wait)

            curr_time = float(datetime.now().timestamp())
            inactive = list()

            self.lock.acquire()
           
            for client, last_contact in self.contacts.items():
                if curr_time - last_contact > 5:
                    inactive.append(client)

            to_remove = list()
            for client in inactive:
                for content, value in self.tree.items():
                    if client in value["clients"]:
                        self.tree[content]["clients"].remove(client)

                        self.logger.info(f"Pruning Service: {client} removed from tree")

                        if len(self.tree[content]["clients"]) == 0:
                            to_remove.append(content)
            
            for content in to_remove:
                self.tree.pop(content)

                self.servers_lock.acquire()
                            
                for server, info in self.servers.items():
                    if info.status and content in info.contents:
                        self.control_socket.sendto(ControlPacket(ControlPacket.LEAVE, contents=[content]).serialize(), (server, 7777))
                        info.status = False

                        self.logger.info(f"Control Service: Leave sent to {server}")
                
                self.servers_lock.release()
            
            self.lock.release()
    
    
    def tracking_service(self):
        tracking_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        tracking_socket.bind(("", 5000))
        
        delay = 3
        tracking_socket.settimeout(delay)

        wait = 2
        while True:
            self.logger.info(f"Tracking Service: Monitorization messages sent")
            
            for server in self.servers:
                initial_timestamp = datetime.now()
                tracking_socket.sendto(ControlPacket(ControlPacket.STATUS).serialize(), (server, 7777))

                try:
                    data, address = tracking_socket.recvfrom(1024)
                    msg = ControlPacket.deserialize(data)

                    self.servers_lock.acquire()
                    self.servers[address[0]].update_metrics(True, delay, initial_timestamp=initial_timestamp, final_timestamp=datetime.now(), contents=msg.contents)
                    self.servers_lock.release()

                    self.logger.debug(f"Tracking Service: Metrics updated for {server}")
                
                except socket.timeout:
                    self.servers_lock.acquire()
                    self.servers[server].update_metrics(False, delay)
                    self.servers_lock.release()

                    self.logger.debug(f"Tracking Service: Timeout occurred for {server}")

            # Update do servidor se necessário
            self.lock.acquire()

            for stream in self.tree:
                best_server = None
                streaming_server = None

                self.servers_lock.acquire()

                for server, info in self.servers.items():
                    if stream in info.contents:
                        if info.status:
                            streaming_server = server

                        if best_server is not None:
                            if best_server[1] > info.metric:
                                best_server = (server, info.metric)

                        else:
                            best_server = (server, info.metric)
                
                if streaming_server is not None and best_server[0] != streaming_server:
                    msg = ControlPacket(ControlPacket.LEAVE, contents=[stream])
                    tracking_socket.sendto(msg.serialize(), (streaming_server, 7777))

                    self.logger.info(f"Tracking Service: Leave message sent to {streaming_server}")
                    self.logger.debug(f"Message sent: {msg}")

                    msg = ControlPacket(ControlPacket.PLAY, port=self.ports[stream], frame_number=self.tree[stream]["frame"], contents=[stream])
                    tracking_socket.sendto(msg.serialize(), (best_server[0], 7777))

                    self.logger.info(f"Tracking Service: Streaming request sent to {best_server[0]}")
                    self.logger.debug(f"Message sent: {msg}")

                    self.servers[streaming_server].status = False
                    self.servers[best_server[0]].status = True
                
                self.servers_lock.release()
            
            self.lock.release()

            time.sleep(wait)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("-b", help="bootstrapper ip")
    parser.add_argument("-f", help="bootstrapper file")
    parser.add_argument("-d", action="store_true", help="activate debug mode")
    args = parser.parse_args()

    debug_mode = False

    if args.d:
        debug_mode = True

    if args.f:
        RP(args.b, is_bootstrapper=True, file=args.f, debug_mode=debug_mode)
    elif args.b:
        RP(args.b, debug_mode=debug_mode)
    else:
        print("Error: Wrong arguments")
        exit()


if __name__ == "__main__":
    main()
