import sys
import threading
import time
import logging
from random import randint

#http://www.bogotobogo.com/python/Multithread/python_multithreading_Synchronization_Semaphore_Objects_Thread_Pool.php

#recupera parâmetros passados na linha de comando
params = sys.argv[1:]

n = 0

if len(params) == 1:
    n = int(params[0])
else:
    print("erro. Eh necessario informar o numero de vezes que as cores deverao ser impressas.")
    exit()

logging.basicConfig(level=logging.DEBUG,
                    format='(%(threadName)-9s) %(message)s',)

def run(semaphore, N):
    with semaphore:
        name = threading.currentThread().getName()
        seconds = randint(0, 9)
        time.sleep(seconds)
        print(name)


semaphore = threading.BoundedSemaphore(1)

names = ["vermelho", "azul", "verde"]
for i in range(n):
    for name in names:
        thread = threading.Thread(group = None, target = run, name=name, args = (semaphore, n))
        thread.start()
