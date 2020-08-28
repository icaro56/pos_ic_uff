from .PRAlgorithmBase import *
from Address import *

class LRUAlgorithm(PRAlgorithmBase):

    #def __init__(self, cache):
     #  PRAlgorithmBase.__init__(self, cache)

    def insert(self, addressValue):
        self.queue.append(addressValue)

    def pop(self):
        elementRemoved = self.queue.pop(0)
        return elementRemoved

    def removeAndGetAddressInQueue(self, newvalue):
        index = 0
        for idx, value in enumerate(self.queue):
            if value.address == newvalue:
                index = idx
                break

        address = self.queue.pop(index)

        return address

    def cacheHit(self, newvalue):
        if super(LRUAlgorithm, self).cacheHit(newvalue):
            newAddress = self.removeAndGetAddressInQueue(newvalue)
            self.insert(newAddress)

            return True

        return False
