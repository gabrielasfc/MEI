import sys
from time import time

HEADER_SIZE = 12

class RtpPacket:	
	header = bytearray(HEADER_SIZE)
	
	def __init__(self):
		pass
		
	def encode(self, version, padding, extension, cc, seqnum, marker, pt, ssrc, payload):
		"""Encode the RTP packet with header fields and payload."""
		timestamp = int(time())
		header = bytearray(HEADER_SIZE) 
		header[0] = (header[0] | version << 6) & 0xC0; # 2 bits
		header[0] = (header[0] | padding << 5); # 1 bit
		header[0] = (header[0] | extension << 4); # 1 bit
		header[0] = (header[0] | (cc & 0x0F)); # 4 bits
		header[1] = (header[1] | marker << 7); # 1 bit
		header[1] = (header[1] | (pt & 0x7f)); # 7 bits
		header[2] = (seqnum >> 8); 
		header[3] = (seqnum & 0xFF);
		header[4] = (timestamp >> 24);
		header[5] = (timestamp >> 16) & 0xFF;
		header[6] = (timestamp >> 8) & 0xFF;
		header[7] = (timestamp & 0xFF);
		header[8] = (ssrc >> 24);
		header[9] = (ssrc >> 16) & 0xFF;
		header[10] = (ssrc >> 8) & 0xFF;
		header[11] = ssrc & 0xFF
		# set header and  payload
		self.header = header
		self.payload = payload
		
	def decode(self, byte_stream):
		"""Decode the RTP packet."""
		self.header = bytearray(byte_stream[:HEADER_SIZE])
		self.payload = byte_stream[HEADER_SIZE:]
	
	def get_version(self):
		"""Return RTP version."""
		return int(self.header[0] >> 6)
	
	def get_seq_num(self):
		"""Return sequence (frame) number."""
		seqNum = self.header[2] << 8 | self.header[3]
		return int(seqNum)
	
	def get_timestamp(self):
		"""Return timestamp."""
		timestamp = self.header[4] << 24 | self.header[5] << 16 | self.header[6] << 8 | self.header[7]
		return int(timestamp)
	
	def get_payload_type(self):
		"""Return payload type."""
		pt = self.header[1] & 127
		return int(pt)
	
	def get_payload(self):
		"""Return payload."""
		return self.payload
		
	def get_packet(self):
		"""Return RTP packet."""
		return self.header + self.payload

	def print_header(self):
		print("[RTP Packet] Version: ...")


