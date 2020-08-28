

# n = 3
# partitions = []
# i = 0;
#
# while i < n:
#     r = n - i
#     diff = n - r
#
#     partitions.append(r)
#     if diff != 0:
#         if diff == 1:
#             partitions.append(diff)
#         else:
#             j = 0
#             auxDiff = diff
#             auxPartitions = list(partitions)
#             while j < diff:
#                 auxDiff = diff - j
#                 internDiff = diff - auxDiff
#                 if internDiff <= 0:
#                     auxPartitions.append(auxDiff)
#                     print auxPartitions
#                     del auxPartitions[:]
#                     auxPartitions = list(partitions)
#                 else:
#                     auxPartitions.append(auxDiff)
#
#                 j+=1
#
#
#
#     print(partitions)
#     del partitions[:]
#     i+=1


def partition(number):
    answer = []
    answer.append((number, ))
    for x in range(1, number):
        for y in partition(number - x):
            if not answer.__contains__(tuple(sorted((x, ) + y))):
                answer.append(tuple(sorted((x, ) + y)))
    return answer

print partition(3)









