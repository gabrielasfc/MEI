import argparse
import socket
import threading
import logging
import time
import random
import os
import errno
from datetime import datetime
from tkinter import *
import tkinter.messagebox
from PIL import Image, ImageTk
from packets.control_packet import ControlPacket
from packets.rtp_packet import RtpPacket

CACHE_FILE_NAME = "cache-"
CACHE_FILE_EXT = ".jpg"

class Client:
    def __init__(self, master, bootstrapper, videofile, debug_mode=False):
        self.master = master
        self.master.protocol("WM_DELETE_WINDOW", self.exit_client)
        self.videofile = videofile
        self.neighbour = None

        address = bootstrapper.split(":")
        self.bootstrapper = (address[0], int(address[1]))

        self.create_widgets()

        self.control_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.control_socket.bind(("", 7777))

        if debug_mode:
            logging.basicConfig(format='%(asctime)s [%(levelname)s] - %(message)s', datefmt='%H:%M:%S', level=logging.DEBUG)
        else:
            logging.basicConfig(format='%(asctime)s [%(levelname)s] - %(message)s', datefmt='%H:%M:%S', level=logging.INFO)
        self.logger = logging.getLogger()

        self.setup() # Request neighbours

        self.stop_event = threading.Event()

        threading.Thread(target=self.control_service, args=()).start()
        threading.Thread(target=self.polling_service, args=()).start()
        
        self.rtsp_seq = 0
        self.session_id = random.randint(1,100)
        self.request_sent = -1
        self.teardown_acked = 0
        self.frame_nr = 0
        self.play_movie()


    def create_widgets(self):
        """Build GUI."""
        # Create Play button		
        self.start = Button(self.master, width=20, padx=3, pady=3)
        self.start["text"] = "Play"
        self.start["command"] = self.play_movie
        self.start.grid(row=1, column=1, padx=2, pady=2)
        
        # Create Stop button			
        self.stop = Button(self.master, width=20, padx=3, pady=3)
        self.stop["text"] = "Stop"
        self.stop["command"] = self.stop_movie
        self.stop.grid(row=1, column=2, padx=2, pady=2)
        
        # Create Exit button
        self.exit = Button(self.master, width=20, padx=3, pady=3)
        self.exit["text"] = "Exit"
        self.exit["command"] =  self.exit_client
        self.exit.grid(row=1, column=3, padx=2, pady=2)
        
        # Create a label to display the movie
        self.label = Label(self.master, height=19)
        self.label.grid(row=0, column=0, columnspan=4, sticky=W+E+N+S, padx=5, pady=5) 


    def setup(self):
        self.control_socket.settimeout(5) 
        while True:
            self.control_socket.sendto(ControlPacket(ControlPacket.NEIGHBOURS).serialize(), self.bootstrapper)
            self.logger.info("Setup: Asked for neighbours")

            try:
                data, _ = self.control_socket.recvfrom(1024)
                msg = ControlPacket.deserialize(data)

                if msg.type == ControlPacket.NEIGHBOURS and msg.response == 1:
                    self.neighbour = msg.neighbours[0]
                    self.logger.info("Setup: Neighbours received")
                    self.logger.debug(f"Neighbours: {self.neighbour}")

                    break
                else:
                    self.logger.info("Setup: Unexpected response received")
                    exit() # É este o comportamento que queremos ?
                
            except socket.timeout:
                self.logger.info("Setup: Could not receive response to neighbours request")

        self.control_socket.settimeout(None)

    def play_movie(self):
        """Play button handler."""
        self.stop_event.clear()

        msg = ControlPacket(ControlPacket.PLAY, contents=[self.videofile])
        self.control_socket.sendto(msg.serialize(), (self.neighbour, 7777))
        
        self.logger.info(f"Subscription sent to {self.neighbour}")
        self.logger.debug(f"Message sent: {msg}")
    

    def stop_movie(self):
        """Stop button handler."""
        self.frame_nr = 0

        msg = ControlPacket(ControlPacket.LEAVE, contents=[self.videofile])
        self.control_socket.sendto(msg.serialize(), (self.neighbour, 7777))

        self.logger.info(f"Leave sent to {self.neighbour}")
        self.logger.debug(f"Message sent: {msg}")

        self.stop_event.set()


    def exit_client(self):
        """Exit button handler."""
        self.stop_event.set()

        self.frame_nr = 0
        msg = ControlPacket(ControlPacket.LEAVE, contents=[self.videofile])
        self.control_socket.sendto(msg.serialize(), (self.neighbour, 7777))
        
        self.logger.info(f"Leave sent to {self.neighbour}")
        self.logger.debug(f"Message sent: {msg}")

        os.remove(CACHE_FILE_NAME + str(self.session_id) + CACHE_FILE_EXT) # Delete the cache image from
        self.master.destroy() # Close the gui window


    def listen_rtp(self, port):		
        """Listen for RTP packets."""

        self.logger.info(f"Receiving RTP Packets")        
        
        try:
            data_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            data_socket.bind(("", port))
        
        except socket.error as e:
            if e.errno == errno.EADDRINUSE:
                pass
        
        while True:
            try:
                data, addr = data_socket.recvfrom(20480)
                if data:
                    rtp_packet = RtpPacket()
                    rtp_packet.decode(data)
                    
                    curr_frame_nr = rtp_packet.get_seq_num()
                    self.logger.debug(f"RTP Packet {curr_frame_nr} received from {addr[0]}")

                    if curr_frame_nr > self.frame_nr: # Discard the late packet
                        self.frame_nr = curr_frame_nr
                        self.update_movie(self.write_frame(rtp_packet.get_payload()))
            
            except:                
                data_socket.shutdown(socket.SHUT_RDWR)
                data_socket.close()
                break
                
    
    def write_frame(self, data):
        """Write the received frame to a temp image file. Return the image file."""
        cachename = CACHE_FILE_NAME + str(self.session_id) + CACHE_FILE_EXT
        file = open(cachename, "wb")
        file.write(data)
        file.close()
        
        return cachename


    def update_movie(self, image_file):
        """Update the image file as video frame in the GUI."""
        photo = ImageTk.PhotoImage(Image.open(image_file))
        self.label.configure(image = photo, height=288) 
        self.label.image = photo


    def control_worker(self, address, msg):
        if msg.type == ControlPacket.PLAY and msg.response == 1:
            self.logger.info(f"Control Service: Confirmation message received from {address[0]}")
            self.logger.debug(f"Message received: {msg}")

            threading.Thread(target=self.listen_rtp, args=(msg.port,)).start()

        
    def control_service(self):
        try:
            self.control_socket.settimeout(None)

            while True:
                data, address = self.control_socket.recvfrom(1024)
                message = ControlPacket.deserialize(data)

                threading.Thread(target=self.control_worker, args=(address, message,)).start()

        finally:
            self.control_socket.close()


    def polling_service(self):
        try:
            wait = 4
            
            while True:
                time.sleep(wait)

                if not self.stop_event.is_set():
                    msg = ControlPacket(ControlPacket.POLLING, timestamp=float(datetime.now().timestamp()), contents=[self.videofile])

                    self.control_socket.sendto(msg.serialize(), (self.neighbour, 7777))

                    self.logger.info(f"Polling Service: Polling message sent to neighbour {self.neighbour}")
                    self.logger.debug(f"Message sent: {msg}")
        
        finally:
            self.control_socket.close()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("-b", help="bootstrapper ip")
    parser.add_argument("-f", help="filename")
    parser.add_argument("-d", action="store_true", help="activate debug mode")
    args = parser.parse_args()

    debug_mode = False

    if args.d:
        debug_mode = True

    if args.b and args.f:
        root = Tk()
        app = Client(root, args.b, args.f, debug_mode=debug_mode)
        app.master.title("Client")	
        root.mainloop()
        exit()
        
    else:
        print("Error: Wrong arguments")
        exit()


if __name__ == "__main__":
    main()