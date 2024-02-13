import argparse
import socket
import threading
import logging
import time
from datetime import datetime
from random import randint
from utils.videostream import VideoStream
from packets.rtp_packet import RtpPacket
from packets.control_packet import ControlPacket

class Server:
    def __init__(self, filenames, debug_mode=False):
        self.videostreams = dict()
        for file in filenames:
            self.videostreams[file] = VideoStream("../videos/"+file)
            
        self.control_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.control_socket.bind(('', 7777))

        self.events = dict()

        if debug_mode:
            logging.basicConfig(format='%(asctime)s [%(levelname)s] - %(message)s', datefmt='%H:%M:%S', level=logging.DEBUG)
        else:
            logging.basicConfig(format='%(asctime)s [%(levelname)s] - %(message)s', datefmt='%H:%M:%S', level=logging.INFO)
        self.logger = logging.getLogger()

        self.control_service()


    def control_worker(self, addr, msg):
        """Process RTSP request sent from the client."""
        if msg.type == ControlPacket.PLAY and msg.response == 0:
            self.logger.info(f"Control Service: Streaming request received from {addr[0]}")
            self.logger.debug(f"Message received: {msg}")

            filename = msg.contents[0]

            if filename in self.videostreams:
                send_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                
                # Create a new thread and start sending RTP packets
                self.events[filename] = threading.Event()
                threading.Thread(target=self.send_rtp, args=(addr[0], msg.port, msg.frame_number, send_socket, filename)).start()
            else:
                msg.error = 1
                self.control_socket.sendto(msg.serialize(), addr) # O ficheiro não está nas streams
        
        elif msg.type == ControlPacket.LEAVE and msg.response == 0:
            self.logger.info(f"Control Service: Leave received from {addr[0]}")
            self.logger.debug(f"Message received: {msg}")

            filename = msg.contents[0]

            self.videostreams[filename].restart()
            self.events[filename].set()


        elif msg.type == ControlPacket.STATUS and msg.response == 0:
            msg = ControlPacket(ControlPacket.STATUS, response=1, contents=list(self.videostreams.keys()))
            self.control_socket.sendto(msg.serialize(), addr)

            self.logger.info(f"Control Service: Metrics sent to {addr[0]}")
            self.logger.debug(f"Message sent: {msg}")


    def control_service(self):
        try:
            while True:
                msg, addr = self.control_socket.recvfrom(1024)
                msg = ControlPacket.deserialize(msg)

                threading.Thread(target=self.control_worker, args=(addr, msg,)).start()

        finally:
            self.control_socket.close()


    def send_rtp(self, addr, port, frame_number, send_stream_socket, filename):
        """Send RTP packets over UDP."""
        if frame_number is not None:
            self.videostreams[filename].seek_to_frame(frame_number)
        
        self.logger.info(f"Streaming Service: Sending RTP Packets to {addr}")

        while True:
            self.events[filename].wait(0.05)
            
            # Stop sending if request is LEAVE
            if self.events[filename].is_set():
                break
                
            data = self.videostreams[filename].get_next_frame()
            
            if data:
                frame_nr = self.videostreams[filename].get_frame_nr()
                try:
                    packet =  self.make_rtp(data, frame_nr)
                    send_stream_socket.sendto(packet, (addr, port))

                    self.logger.debug(f"Streaming Service: RTP Packet {frame_nr} sent to {addr}")
                except:
                    self.logger.debug(f"Streaming Service: An error occurred sending RTP Packet {frame_nr} to {addr[0]}")
        
        send_stream_socket.close()


    def make_rtp(self, payload, frame_nr):
        """RTP-packetize the video data."""
        version = 2
        padding = 0
        extension = 0
        cc = 0
        marker = 0
        pt = 26 # MJPEG type
        seqnum = frame_nr
        ssrc = 0
        
        rtpPacket = RtpPacket()
        rtpPacket.encode(version, padding, extension, cc, seqnum, marker, pt, ssrc, payload)
        
        return rtpPacket.get_packet()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("-videostreams", help="filenames", type=lambda arg: arg.split(" "))
    parser.add_argument("-d", action="store_true", help="activate debug mode")
    args = parser.parse_args()

    debug_mode = False

    if args.d:
        debug_mode = True

    server = Server(args.videostreams, debug_mode=debug_mode)


if __name__ == "__main__":
    main()