class PRAlgorithmBase:

    def __init__(self, cache, cacheSize):
        self.queue = []
        self.mCache = cache
        self.cacheSize = cacheSize

    def insert(self, addressValue):
        raise NotImplementedError

    def pop(self):
        raise NotImplementedError

    def cacheHit(self, newvalue):
        for value in self.mCache:
            if value.address == newvalue:
                return True

        return False

    def cacheSwap(self, oldAddress, newValue):

        self.mCache[oldAddress.cacheIndex].address = newValue
        self.mCache[oldAddress.cacheIndex].accessCount = 0
        return self.mCache[oldAddress.cacheIndex]

        #for idx, value in enumerate(self.mCache):
        #    if value.address == oldAddress.address:
        #        self.mCache[idx].address = newValue
        #        self.mCache[idx].accessCount = 0
        #        return self.mCache[idx]
        #return None
