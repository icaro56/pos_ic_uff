import sys
from Address import *
from algorithms.LFUAlgorithm import *
from algorithms.FIFOAlgorithm import *
from algorithms.RandomAlgorithm import *
from algorithms.LRUAlgorithm import *
from util import *

#recupera parâmetros passados na linha de comando
params = sys.argv[1:]

if len(params) == 3:
    filename = params[0]
    cacheSize = int(params[1])
    algorithm = params[2]
    print("Parametros informados\n")
    print("nome do arquivo: " + filename)
    print("tamanho da cache: " + str(cacheSize))
    print("algoritmo: " + algorithm + "\n")
else:
    print("erro. Eh necessario informar os 3 campos: nome do arquivo, tamanho da cache (1,2,3, ..., n) e algoritmo (fifo, lru, lfu e random)")
    exit()

#tentando abrir o arquivo de leitura
arq = None
try:
    arq = open(filename, 'r') # tratar exceções
except IOError:
    print("Nao eh possivel ler o arquivo:", filename)
    exit()

#jogando o conteudo do arquivo para uma lista mp (memoria principal)
mp = arq.read().splitlines()
#print(mp)
arq.close()

#criando um arquivo de saída que faz um relatório do que foi executado
saida = open('saida.txt', 'w')
texto = []

#vetor responsavel por armazenar as paginas da memoria cache
mCache = []

#objeto responsavel por receber a implementaçao do algoritmo desejado pelo usuario
pageReplacementAlgorithm = None

if algorithm == "fifo":
    pageReplacementAlgorithm = FIFOAlgorithm(mCache, cacheSize)
elif algorithm == "lru":
    pageReplacementAlgorithm = LRUAlgorithm(mCache, cacheSize)
elif algorithm == "lfu":
    pageReplacementAlgorithm = LFUAlgorithm(mCache, cacheSize)
elif algorithm == "random":
    pageReplacementAlgorithm = RandomAlgorithm(mCache, cacheSize)
else:
    print("Algoritmo informado nao existente.")
    exit()

texto.append('Executando Algoritmo: ' + algorithm)
print('Executando Algoritmo: ' + algorithm)

hitCount = 0
missCount = 0

index = 0
while index < len(mp):

    element = mp[index]

    #testa se ha hit e internamente ja faz os controles
    if pageReplacementAlgorithm.cacheHit(element):
        hitCount += 1
    else:
        #testa se ha espaco vazio na memoria cache
        if (len(mCache) < cacheSize):
            newAddress = Address(element, len(mCache), 0)
            mCache.append(newAddress)
            pageReplacementAlgorithm.insert(newAddress)
        #caso contrario, eh uma falta
        else:
            missCount += 1
            addressRemoved = pageReplacementAlgorithm.pop()
            newAddress = pageReplacementAlgorithm.cacheSwap(addressRemoved, element)
            pageReplacementAlgorithm.insert(newAddress)

    txtStep = "\n\nPasso: " + str(index)
    txtNewElement = "\nElemento lido: " + str(element)
    txtNewState = "\nEstado atual: " + formatCacheToPrint(mCache)

    texto.append(txtStep)
    texto.append(txtNewElement)
    texto.append(txtNewState)

    print(txtStep + txtNewElement + txtNewState)

    input("Tecle ENTER para continuar")
    index = index + 1


hitRate = "{0:.2f}%".format(hitCount/len(mp) * 100)
missRate = "{0:.2f}%".format(missCount/len(mp) * 100)

texto.append("\n\nTaxa de acertos: " + hitRate)
texto.append("\nTaxa de faltas: " + missRate)
print("\nTaxa de acertos: " + hitRate)
print("Taxa de faltas: " + missRate)

saida.writelines(texto)
saida.close()
