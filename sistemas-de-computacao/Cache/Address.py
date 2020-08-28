class Address:

    def __init__(self, value, cacheIndex, accessCount = 0):
        self.address = value
        self.accessCount = accessCount
        self.cacheIndex = cacheIndex
