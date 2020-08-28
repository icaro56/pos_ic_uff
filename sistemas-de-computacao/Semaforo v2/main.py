import sys
import threading
import time
import logging
from random import randint

#definição do contador
count = 0

#define a quantidade de parametros
params = sys.argv[1:]

#recebe a quantidade de parâmetros informados pelo usuário
if len(params) == 1:
    n = int(params[0])
else:
    print("erro. Eh necessario informar o numero de vezes que as cores deverao ser impressas.")
    exit()

#define a execução do semáforo
def run(cor, id):
    global count
    for i in range(n):
        while(count != id):
            if count == id :
                break

        seconds = randint(0, 9)
        time.sleep(seconds)
        print(cor)

        count = count + 1

        if (id == 3):
            count = 1

#define as threads
thread_vm = threading.Thread(group=None, target=run, args=("vermelho", 1))
thread_a = threading.Thread(group=None, target=run, args=("azul", 2))
thread_vd = threading.Thread(group=None, target=run, args=("verde", 3))

#alteração do valor do contador
count = 1

#inicia e recupera a execução da thread
thread_vm.start()
thread_a.start()
thread_vd.start()

thread_vm.join()
thread_a.join()
thread_vd.join()

