def ordenar(lista):
    tam = len(lista)
    novaLista = [None]*tam

    for i in range(0, tam):
        novaLista[lista[i]] = lista[i]

    return novaLista

unorderedList = [5, 4, 2, 3, 7, 1, 6, 0]
print ordenar(unorderedList)
