import io
import struct
from bitstring import BitArray, ConstBitStream

class ControlPacket:
    NEIGHBOURS = 0
    STATUS = 1
    PLAY = 2
    LEAVE = 3
    MEASURE = 4
    POLLING = 5

    def __init__(self, msg_type, response=0, nack=0, alive=0, port=None, frame_number=None, timestamp=0, hops=list(), neighbours=list(), contents=list(), servers=list()):
        # Header
        self.type = msg_type
        self.response = response # Alterar para bit
        self.nack = nack # Alterar para bit
        self.alive = alive
        self.has_port = 0 # 1 bit para dizer se tem ou não porta na mensagem
        self.has_frame = 0 # 1 bit para dizer se tem ou não frame nr na mensagem
        self.port = port
        self.frame_number = frame_number
        self.timestamp = timestamp
        # Data
        self.hops = hops
        self.servers = servers
        self.neighbours = neighbours
        self.contents = contents

    
    def __str__(self):
        return f"Type: {self.type} | Response: {self.response} | NACK: {self.nack} | Frame Number: {self.frame_number} | Timestamp: {self.timestamp} |Hops: {self.hops} | Servers: {self.servers} | Neighbours: {self.neighbours} | Contents: {self.contents}"


    def __repr__(self):
        return f"Type: {self.type} | Response: {self.response} | NACK: {self.nack} | Frame Number: {self.frame_number} | Timestamp: {self.timestamp} | Hops: {self.hops} | Servers: {self.servers} | Neighbours: {self.neighbours} | Contents: {self.contents}"


    def serialize_ip(self, ip):
        byte_array = bytearray()
        ip_splitted = ip.split('.')

        for number in ip_splitted:
            byte_array += int(number).to_bytes(1, 'big')
        
        return byte_array


    def serialize(self):
        byte_array = bytearray()

        # Header
        # Type - 1 byte
        byte_array += self.type.to_bytes(1, 'big')

        # Flags - 1 byte
        flags = BitArray()

        # Response - 1 bit
        flags.append(BitArray(uint=self.response, length=1))

        # NACK - 1 bit
        flags.append(BitArray(uint=self.nack, length=1))

        # Alive - 1 bit
        flags.append(BitArray(uint=self.alive, length=1))

        # HasPort - 1 bit
        if self.port is not None:
            self.has_port = 1
        flags.append(BitArray(uint=self.has_port, length=1))

        # HasFrame - 1 bit
        if self.frame_number is not None:
            self.has_frame = 1
        flags.append(BitArray(uint=self.has_frame, length=1))

        flags.append(BitArray(uint=0, length=3)) # Completar o byte

        byte_array += flags.bytes

        # Timestamp - 8 bytes
        byte_array += struct.pack('>d', self.timestamp)

        
        # Payload
        # Port - 2 bytes
        if self.has_port == 1:
            byte_array += self.port.to_bytes(2, 'big')

        # Frame Number - 4 bytes
        if self.has_frame == 1:
            byte_array += self.frame_number.to_bytes(4, 'big')

        # Number of hops - 1 byte
        byte_array += len(self.hops).to_bytes(1, 'big')

        # Hops
        for hop in self.hops:
            # IP - 4 bytes
            byte_array += self.serialize_ip(hop)

        # Number of servers - 1 byte
        byte_array += len(self.servers).to_bytes(1, 'big')

        # Servers
        for server in self.servers:
            # IP - 4 bytes
            byte_array += self.serialize_ip(server)

        # Number of neighbours - 1 byte
        byte_array += len(self.neighbours).to_bytes(1, 'big')

        # Neighbours
        for neighbour in self.neighbours:
            # IP - 4 bytes
            byte_array += self.serialize_ip(neighbour)

        # Number of contents - 1 byte
        byte_array += len(self.contents).to_bytes(1, 'big')

        # Contents
        for content in self.contents:
            # Tamanho string content - 1 byte
            byte_array += len(content).to_bytes(1, 'big')
            byte_array += content.encode('utf-8')

        return byte_array


    @staticmethod
    def deserialize_ip(bytes):
        byte_array = io.BytesIO(bytes)

        octect1 = int.from_bytes(byte_array.read(1), byteorder='big')
        octect2 = int.from_bytes(byte_array.read(1), byteorder='big')
        octect3 = int.from_bytes(byte_array.read(1), byteorder='big')
        octect4 = int.from_bytes(byte_array.read(1), byteorder='big')

        return str(octect1) + '.' + str(octect2) + '.' + str(octect3) + '.' + str(octect4)


    @staticmethod
    def deserialize(bytes):
        byte_array = io.BytesIO(bytes)

        msg_type = int.from_bytes(byte_array.read(1), byteorder='big')

        flags = ConstBitStream(byte_array.read(1))

        response = flags.read('uint:1')
        nack = flags.read('uint:1')
        alive = flags.read('uint:1')
        has_port = flags.read('uint:1')
        has_number = flags.read('uint:1')

        timestamp = struct.unpack('>d', byte_array.read(8))[0]

        port = None
        if has_port == 1:
            port = int.from_bytes(byte_array.read(2), byteorder='big')

        frame_number = None
        if has_number == 1:
            frame_number = int.from_bytes(byte_array.read(4), byteorder='big')

        hops = list()
        servers = list()
        neighbours = list()
        contents = list()
    	
        nr_hops = int.from_bytes(byte_array.read(1), byteorder='big')
        for _ in range(nr_hops):
            hops.append(ControlPacket.deserialize_ip(byte_array.read(4)))

        nr_servers = int.from_bytes(byte_array.read(1), byteorder='big')
        for _ in range(nr_servers):
            servers.append(ControlPacket.deserialize_ip(byte_array.read(4)))

        nr_neighbours = int.from_bytes(byte_array.read(1), byteorder='big')
        for _ in range(nr_neighbours):
            neighbours.append(ControlPacket.deserialize_ip(byte_array.read(4)))

        nr_contents = int.from_bytes(byte_array.read(1), byteorder='big')
        for _ in range(nr_contents):
            string_len = int.from_bytes(byte_array.read(1), byteorder='big')
            contents.append(byte_array.read(string_len).decode('utf-8'))
        
        return ControlPacket(msg_type, response=response, nack=nack, alive=alive, port=port, frame_number=frame_number, timestamp=timestamp, hops=hops, servers=servers, neighbours=neighbours, contents=contents)
    