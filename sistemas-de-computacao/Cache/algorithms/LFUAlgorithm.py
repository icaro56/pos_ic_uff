from .PRAlgorithmBase import *
import math

class LFUAlgorithm(PRAlgorithmBase):

    #def __init__(self, cache):
     #  PRAlgorithmBase.__init__(self, cache)

    def insert(self, addressValue):
        self.queue.append(addressValue)

    def pop(self):
        minValue = math.inf
        minAddress = None
        minIndex = 0
        for idx, value in enumerate(self.queue):
            if value.accessCount < minValue:
                minValue = value.accessCount
                minAddress = value
                minIndex = idx

        self.queue.pop(minIndex)
        return minAddress

    def incrementAccessCount(self, element):
        for idx, value in enumerate(self.mCache):
            if value.address == element:
                self.mCache[idx].accessCount += 1

    def cacheHit(self, newvalue):
        if super(LFUAlgorithm, self).cacheHit(newvalue):
            self.incrementAccessCount(newvalue)
            return True

        return False
