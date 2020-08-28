from .PRAlgorithmBase import *

class FIFOAlgorithm(PRAlgorithmBase):

    #def __init__(self, cache):
     #  PRAlgorithmBase.__init__(self, cache)

    def insert(self, addressValue):
        self.queue.append(addressValue)

    def pop(self):
        elementRemoved = self.queue.pop(0)
        return elementRemoved
