def swapp(lista1, pos1, pos2):
    aux = lista1[pos1]
    lista1[pos1] = lista1[pos2]
    lista1[pos2] = aux

def permutations(lista1, currentIndex, lastIndex):
    if currentIndex == lastIndex:
        print lista1
    else:
        for i in range(currentIndex, lastIndex + 1):
            if (currentIndex == i):
                permutations(lista1, currentIndex + 1, lastIndex)
            else:
                swapp(lista1, currentIndex, i)
                permutations(lista1, currentIndex + 1, lastIndex)
                swapp(lista1, currentIndex, i)


n = 3
lista = range(1, n + 1)

permutations(lista, 0, len(lista) - 1)







