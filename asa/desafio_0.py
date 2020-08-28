#desafio: fazer um algoritmo otimo para encontrar o min e o max em uma lista desordenada

lista = [0, 19, 10, 5, 11, 18, 1, 3, 5, 7]
min = lista[0]
max = lista[0]

for i in range(1, len(lista)):
    if lista[i] < min:
        min = lista[i]
    else:
        if lista[i] > max:
            max = lista[i]

print min
print max
