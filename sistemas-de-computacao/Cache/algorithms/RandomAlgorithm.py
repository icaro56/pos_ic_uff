from .PRAlgorithmBase import *
import random

class RandomAlgorithm(PRAlgorithmBase):

    #def __init__(self, cache):
     #  PRAlgorithmBase.__init__(self, cache)

    def insert(self, addressValue):
        self.queue.append(addressValue)

    def pop(self):
        randIndex = random.randint(0, self.cacheSize - 1)
        elementRemoved = self.queue.pop(randIndex)
        return elementRemoved
