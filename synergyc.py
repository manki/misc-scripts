#!/usr/bin/env python
# Copyright 2010 Muthu Kannan. All Rights Reserved.
#
# Sets up an SSH tunnel and starts Synergy Client.

import errno
import os
import signal
import socket
import subprocess
import time

SSH = '/usr/bin/ssh'
SYNERGYC = '/usr/bin/synergyc'
LOCAL_HOST = 'localhost'
SERVER = 'SERVER_HOST_NAME'
SYNERGY_PORT = 24800
LOCAL_PORT = 10100
LOCAL_SYNERGY_SERVER = '%s:%s' % (LOCAL_HOST, LOCAL_PORT)
KEEP_ALIVE = 'while true; do echo -n ""; sleep 60; done'

TUNNEL_ARG = '-L%s:%d:%s:%d' % (LOCAL_HOST, LOCAL_PORT, SERVER, SYNERGY_PORT)

synergyc = None
tunnel = None

killing = False

def Quit(*args):
    """Closes the tunnel and quits Synergy."""
    global killing
    killing = True
    KillProcesses()

def KillProcesses():
    for process in (synergyc, tunnel):
        if process and (process.returncode is None):
            os.kill(process.pid, signal.SIGINT)

def OpenTunnel():
    return subprocess.Popen((SSH, TUNNEL_ARG, SERVER, KEEP_ALIVE))

def WaitForTunnelToOpen():
    MAX_ATTEMPTS = 5
    num_attempts = 0
    sock = None
    while num_attempts < MAX_ATTEMPTS:
        num_attempts += 1
        try:
            sock = socket.create_connection((LOCAL_HOST, LOCAL_PORT), 5.0)
        except socket.error, err:
            if err.errno == errno.ECONNREFUSED:
                time.sleep(1)
    if sock:
        sock.close()

def StartSynergyc():
    return subprocess.Popen((SYNERGYC, '-f', '--no-restart', LOCAL_SYNERGY_SERVER))

def main():
    signal.signal(signal.SIGINT, Quit)

    while not killing:
        global synergyc, tunnel
        tunnel = OpenTunnel()
        WaitForTunnelToOpen()
        synergyc = StartSynergyc()

        try:
            synergyc.wait()
        except OSError:   # When tunnel is killed, we get OSError.
            pass

        KillProcesses()


if __name__ == '__main__':
    main()
