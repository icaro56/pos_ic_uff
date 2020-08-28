import timeit

def invertList():
    lista = [1, 2, 3, 4, 5]

    n = len(lista)
    for i in range(0, n/2):
        temp = lista[i]
        lista[i] = lista[n - i - 1]
        lista[n-i-1] = temp

    print lista

def factorial_recursivo(n):
    return 1 if n < 1 else n * factorial_recursivo(n-1)

def factorial(n):
    fat = [0]*(n+1)
    fat[0] = 1
    for i in range(1, n + 1):
        fat[i] = i * fat[i-1]

    return fat[n]

def factorial_2(n):
    if n == 0:
        return 1

    i = n - 1
    while i > 0:
        n = n * (i)
        i = i - 1

    return n


num = 200

start = timeit.default_timer()
print factorial_recursivo(num)
end = timeit.default_timer()
print ('duracao_0: %f' % (end - start))

start = timeit.default_timer()
print factorial(num)
end = timeit.default_timer()
print ('duracao_1: %f' % (end - start))

start = timeit.default_timer()
print factorial_2(num)
end = timeit.default_timer()
print ('duracao_2: %f' % (end - start))

#Obs1: O tempo gasto altera dependendo da ordem das chamadas.
#Obs2: A funcao recursiva estoura o limite maximo da pilha de chamada quando o numero e grande Ex: 1000!


